import type { RestEndpointMethodTypes } from "@octokit/rest";
import type {
	MyReviewStatus,
	OverallStatus,
} from "../../../../domain/change-request";

type Reviews =
	RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"];

export function computeOverallStatus(activeReviews: Reviews): OverallStatus {
	if (activeReviews.length === 0) {
		return "pending";
	}

	const personReview = new Map<string, Reviews>();
	for (const activeReview of activeReviews) {
		const login = activeReview.user?.login ?? "unknown";
		const person = personReview.get(login);

		if (!person) {
			personReview.set(login, [activeReview]);
			continue;
		}

		personReview.set(login, person.concat([activeReview]));
	}

	const entries = personReview.entries();
	const reviewsArray: Reviews = [];
	function precedence(name: string): number {
		switch (name) {
			case "APPROVED":
				return 10;
			case "CHANGES_REQUESTED":
				return 10;
			default:
				return 0;
		}
	}
	for (const [_, reviews] of entries) {
		const sorted = reviews.sort(
			(a, b) =>
				new Date(a.submitted_at ?? 0).getTime() -
				new Date(b.submitted_at ?? 0).getTime(),
		);
		const reviewState = sorted.reduce((previous, current) => {
			if (precedence(current.state) >= precedence(previous.state))
				return current;
			return previous;
		});

		reviewsArray.push(reviewState);
	}

	const reviewsSorted = reviewsArray.sort(
		(a, b) =>
			new Date(a.submitted_at ?? 0).getTime() -
			new Date(b.submitted_at ?? 0).getTime(),
	);

	const finalState = reviewsSorted.reduce((previous, current) => {
		if (precedence(current.state) >= precedence(previous.state)) return current;
		return previous;
	});

	function stateTransformer(state: string): OverallStatus {
		switch (state) {
			case "CHANGES_REQUESTED":
				return "changes_requested";
			case "APPROVED":
				return "approved";
			case "COMMENTED":
				return "commented_only";
			default:
				return "none";
		}
	}

	return stateTransformer(finalState.state);
}

export function computeMyStatus(
	myLatest: "approved" | "changes_requested" | "commented" | undefined,
	requested: string[],
	overallStatus: OverallStatus,
	meLogin: string | undefined,
): MyReviewStatus {
	if (myLatest) {
		return { kind: "as_author", decision: myLatest };
	}
	if (
		meLogin &&
		requested.includes(meLogin) &&
		(overallStatus === "none" || overallStatus === "pending")
	) {
		return { kind: "needed" };
	}
	if (meLogin) {
		return { kind: "not_needed" };
	}
	return { kind: "unknown" };
}

export function pickMyLatestDecision(
	meLogin: string,
	reviews: Reviews,
): "approved" | "changes_requested" | "commented" | undefined {
	const mine = reviews
		.filter((r) => String(r.user?.login ?? "").toLowerCase() === meLogin)
		.filter((r) => r.state !== "DISMISSED" && r.state !== "PENDING");

	mine.sort(
		(a, b) =>
			new Date(b.submitted_at ?? 0).getTime() -
			new Date(a.submitted_at ?? 0).getTime(),
	);

	const s = mine[0]?.state;
	if (s === "APPROVED") return "approved" as const;
	if (s === "CHANGES_REQUESTED") return "changes_requested" as const;
	if (s === "COMMENTED") return "commented" as const;
	return undefined;
}
