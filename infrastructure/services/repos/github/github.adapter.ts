import type { Octokit } from "@octokit/rest";
import type {
	ChangeRequestRepository,
	RepoRef,
} from "../../../../application/ports/change-request.repository";
import type {
	ChangeRequest,
	ChangeRequestId,
	UserRef,
} from "../../../../domain/change-request";
import type { ChangeRequestQuery } from "../../../../domain/change-request-query";

// Ici tu brancheras Octokit (REST) ou GraphQL

export class GitHubChangeRequestRepository implements ChangeRequestRepository {
	constructor(
		private readonly octokit: Octokit,
		private readonly meProvider: () => Promise<UserRef | null>,
	) {}

	async list(
		repo: RepoRef,
		_query: ChangeRequestQuery,
	): Promise<ChangeRequest[]> {
		const me = await this.meProvider();

		const prs = await this.octokit.pulls.list({
			owner: repo.owner,
			repo: repo.repo,
			state: "open",
			per_page: 100,
		});

		// naïf mais clair : pour chaque PR, récupérer les reviews
		// (on optimisera plus tard via GraphQL / batch / p-limit)
		const out: ChangeRequest[] = [];
		for (const pr of prs.data) {
			const reviews = await this.octokit.pulls.listReviews({
				owner: repo.owner,
				repo: repo.repo,
				pull_number: pr.number,
				per_page: 100,
			});

			out.push(mapGitHubPR(repo, me, pr, reviews.data));
		}
		return out;
	}

	async getById(id: ChangeRequestId): Promise<ChangeRequest> {
		const me = await this.meProvider();

		const pr = await this.octokit.pulls.get({
			owner: id.owner,
			repo: id.repo,
			pull_number: id.number,
		});

		const reviews = await this.octokit.pulls.listReviews({
			owner: id.owner,
			repo: id.repo,
			pull_number: id.number,
			per_page: 100,
		});

		return mapGitHubPR(
			{ owner: id.owner, repo: id.repo },
			me,
			pr.data,
			reviews.data,
		);
	}
}

function mapGitHubPR(
	repo: RepoRef,
	me: UserRef | null,
	pr: any,
	reviews: any[],
): ChangeRequest {
	const requested = (pr.requested_reviewers ?? []).map((u: any) =>
		String(u.login).toLowerCase(),
	);
	const meLogin = me?.login?.toLowerCase();

	const myLatest = meLogin ? pickMyLatestDecision(meLogin, reviews) : undefined;

	const myStatus: ChangeRequest["review"]["myStatus"] = myLatest
		? { kind: "done", decision: myLatest }
		: meLogin && requested.includes(meLogin)
			? { kind: "needed" }
			: meLogin
				? { kind: "not_needed" }
				: { kind: "unknown" };

	return {
		id: { owner: repo.owner, repo: repo.repo, number: pr.number },
		title: pr.title,
		author: { login: pr.user.login },
		state: pr.merged_at ? "merged" : pr.state === "closed" ? "closed" : "open",
		isDraft: Boolean(pr.draft),
		updatedAt: new Date(pr.updated_at),
		webUrl: pr.html_url,
		review: {
			hasAnyReviewActivity: reviews.length > 0,
			myStatus,
		},
	};
}

function pickMyLatestDecision(meLogin: string, reviews: any[]) {
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
