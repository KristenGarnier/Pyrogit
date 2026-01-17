import { parentPort } from "node:worker_threads";
import { Octokit } from "@octokit/rest";
import type { RestEndpointMethodTypes } from "@octokit/rest";
import { ResultAsync } from "neverthrow";
import type { ChangeRequest, UserRef } from "../../../../domain/change-request";
import type { RepoRef } from "../../../../application/ports/change-request.repository";
import { GHPullReviewsError } from "../../../errors/GHPullReviewsError";
import {
	computeMyStatus,
	computeOverallStatus,
	pickMyLatestDecision,
} from "./github.adapter.utils";

type GitHubPR =
	| RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][0]
	| RestEndpointMethodTypes["pulls"]["get"]["response"]["data"];
type Reviews =
	RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"];

function getReviews({
	pr,
	config,
	octokit,
}: {
	pr: GitHubPR;
	config: Pick<
		RestEndpointMethodTypes["pulls"]["listReviews"]["parameters"],
		"owner" | "repo"
	>;
	octokit: Octokit;
}) {
	return ResultAsync.fromPromise(
		octokit.pulls.listReviews({
			...config,
			pull_number: pr.number,
			per_page: 100,
		}),
		(error) =>
			new GHPullReviewsError(
				"One or more review list request failed from gh api",
				{
					cause: error,
				},
			),
	);
}

function mapGitHubPR(
	repo: RepoRef,
	me: UserRef | null,
	pr: GitHubPR,
	reviews: Reviews,
): ChangeRequest {
	const requested = (pr.requested_reviewers ?? []).map((u) =>
		String(u.login).toLowerCase(),
	);
	const meLogin = me?.login?.toLowerCase();
	const myLatest = meLogin ? pickMyLatestDecision(meLogin, reviews) : undefined;
	const isMyPR = Boolean(
		meLogin && pr.user && meLogin === pr.user.login.toLowerCase(),
	);

	const activeReviews = reviews.filter((r) => r.state !== "DISMISSED");
	const overallStatus = computeOverallStatus(activeReviews);
	const hasComments = Boolean(reviews.some((r) => r.state === "COMMENTED"));
	const hasAnyReviewActivity: boolean = overallStatus !== "none" || hasComments;

	const myStatus = computeMyStatus(myLatest, requested, overallStatus, meLogin);

	return {
		id: { owner: repo.owner, repo: repo.repo, number: pr.number },
		title: pr.title,
		author: pr.user ? { login: pr.user.login } : { login: "unknown" },
		taget: pr.base.ref,
		branch: pr.head.ref,
		state: pr.merged_at ? "merged" : pr.state === "closed" ? "closed" : "open",
		isDraft: Boolean(pr.draft),
		updatedAt: new Date(pr.updated_at),
		webUrl: pr.html_url,
		review: {
			hasAnyReviewActivity,
			myStatus,
			overallStatus,
			hasComments,
			isMyPR,
		},
	};
}

parentPort?.on(
	"message",
	async (data: {
		prs: GitHubPR[];
		config: Pick<
			RestEndpointMethodTypes["pulls"]["listReviews"]["parameters"],
			"owner" | "repo"
		>;
		repo: RepoRef;
		me: UserRef;
		token: string;
	}) => {
		const octokit = new Octokit({ auth: data.token });
		try {
			const results = await Promise.all(
				data.prs.map(async (pr) => {
					const reviews = await getReviews({
						pr,
						config: data.config,
						octokit,
					});
					if (reviews.isErr()) throw reviews.error;
					return mapGitHubPR(data.repo, data.me, pr, reviews.value.data);
				}),
			);
			parentPort?.postMessage({ results });
		} catch (error) {
			parentPort?.postMessage({ error });
		}
	},
);
