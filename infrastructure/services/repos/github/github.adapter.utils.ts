import type { RestEndpointMethodTypes } from "@octokit/rest";
import type {
	OverallStatus,
	MyReviewStatus,
} from "../../../../domain/change-request";

type Reviews =
	RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"];

export function computeOverallStatus(
	activeReviews: Reviews,
	requested: string[],
): OverallStatus {
	if (activeReviews.some((r) => r.state === "CHANGES_REQUESTED")) {
		return "changes_requested";
	}
	if (activeReviews.some((r) => r.state === "APPROVED")) {
		return "approved";
	}
	if (activeReviews.some((r) => r.state === "COMMENTED")) {
		return "commented_only";
	}
	if (requested.length > 0) {
		return "pending";
	}
	return "none";
}

export function computeMyStatus(
	myLatest: "approved" | "changes_requested" | "commented" | undefined,
	isMyPR: boolean,
	requested: string[],
	overallStatus: OverallStatus,
	meLogin: string | undefined,
): MyReviewStatus {
	if (myLatest) {
		return { kind: "done", decision: myLatest };
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
