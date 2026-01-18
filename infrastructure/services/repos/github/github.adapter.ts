import { Octokit } from "@octokit/rest";
import type { RestEndpointMethodTypes } from "@octokit/rest";
import { err, ok, type Result, ResultAsync } from "neverthrow";
import { Worker } from "node:worker_threads";
import { cpus } from "node:os";
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
import { GHPullError } from "../../../errors/GHPullError";
import { GHPullListError } from "../../../errors/GHPullListError";
import { GHPullReviewsError } from "../../../errors/GHPullReviewsError";
import { NoUserError } from "../../../errors/NoUserError";
import {
	computeMyStatus,
	computeOverallStatus,
	pickMyLatestDecision,
} from "./github.adapter.utils";
import { hasBeenUpdatedSince } from "../../../react/src/utils/date.utils";

type GitHubPR =
	| RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][0]
	| RestEndpointMethodTypes["pulls"]["get"]["response"]["data"];
type Reviews =
	RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"];

export class GitHubChangeRequestRepository implements ChangeRequestRepository {
	private readonly octokit: Octokit;
	private readonly token: string;

	constructor(
		token: string | Octokit,
		private readonly meProvider: () => Promise<UserRef | null>,
	) {
		if (typeof token === "string") {
			this.token = token;
			this.octokit = new Octokit({ auth: token });
		} else {
			this.token = "mock";
			this.octokit = token;
		}
	}

	async list(
		repo: RepoRef,
		query: ChangeRequestQuery,
	): Promise<
		Result<ChangeRequest[], Error | GHPullListError | GHPullReviewsError>
	> {
		const me = await this.meProvider();
		if (!me) return err(new NoUserError("User could not be found"));

		const config = {
			owner: repo.owner,
			repo: repo.repo,
			since: query.since,
		};

		const result = await this.getPullsList({
			...config,
			state: "open",
			per_page: 100,
		}).andThen(({ data: prs }) => {
			const prsSince = prs.filter((pr) =>
				query.since
					? hasBeenUpdatedSince(new Date(pr.updated_at), query.since)
					: true,
			);
			if (prsSince.length === 0) return ok([]);

			return this.getReviewsList({
				config: { ...config },
				prs: prsSince,
				repo,
				me,
			});
		});
		if (result.isErr()) return err(result.error);

		return ok(result.value);
	}

	async listClosed(
		repo: RepoRef,
		query: ChangeRequestQuery,
	): Promise<Result<ChangeRequest[], Error | GHPullListError>> {
		const me = await this.meProvider();
		if (!me) return err(new NoUserError("User could not be found"));

		const config = {
			owner: repo.owner,
			repo: repo.repo,
			since: query.since,
		};

		const result = await this.getPullsList({
			...config,
			state: "closed",
			per_page: 100,
		}).andThen(({ data: prs }) => {
			const prsSince = prs.filter((pr) =>
				query.since
					? hasBeenUpdatedSince(new Date(pr.updated_at), query.since)
					: true,
			);
			if (prsSince.length === 0) return ok([]);

			const changeRequest = prsSince.map((pr) =>
				this.mapGitHubPR(repo, me, pr, []),
			);

			return ok(changeRequest);
		});
		if (result.isErr()) return err(result.error);

		return ok(result.value);
	}

	async getById(
		id: ChangeRequestId,
	): Promise<Result<ChangeRequest, Error | GHPullError | GHPullReviewsError>> {
		const me = await this.meProvider();
		if (!me) return err(new NoUserError("could not be found"));

		const result = await this.getPull({
			owner: id.owner,
			repo: id.repo,
			pull_number: id.number,
		}).andThen((response) => {
			return this.getReviews({
				config: {
					owner: id.owner,
					repo: id.repo,
				},
				pr: response.data,
			}).map((reviews) => {
				return this.mapGitHubPR(id, me, response.data, reviews.data);
			});
		});

		if (result.isErr()) return err(result.error);
		return ok(result.value);
	}

	private getPullsList(
		config: RestEndpointMethodTypes["pulls"]["list"]["parameters"],
	) {
		return ResultAsync.fromPromise(
			this.octokit.pulls.list(config),
			(error) =>
				new GHPullListError("Could not retrieve pulls from gh api", {
					cause: error,
				}),
		);
	}

	private getPull(
		config: RestEndpointMethodTypes["pulls"]["get"]["parameters"],
	) {
		return ResultAsync.fromPromise(
			this.octokit.pulls.get(config),
			(error) =>
				new GHPullError("Could not retrieve pull from gh api", {
					cause: error,
				}),
		);
	}

	private getReviews({
		pr,
		config,
	}: {
		pr: GitHubPR;
		config: Pick<
			RestEndpointMethodTypes["pulls"]["listReviews"]["parameters"],
			"owner" | "repo"
		>;
	}) {
		return ResultAsync.fromPromise(
			this.octokit.pulls.listReviews({
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

	private getReviewsList({
		prs,
		config,
		repo,
		me,
	}: {
		prs: GitHubPR[];
		config: Pick<
			RestEndpointMethodTypes["pulls"]["listReviews"]["parameters"],
			"owner" | "repo"
		>;
		repo: RepoRef;
		me: UserRef;
	}) {
		return ResultAsync.fromPromise(
			(async () => {
				const numWorkers = cpus().length;
				const chunkSize = Math.ceil(prs.length / numWorkers);
				const chunks: GitHubPR[][] = [];
				for (let i = 0; i < prs.length; i += chunkSize) {
					chunks.push(prs.slice(i, i + chunkSize));
				}
				const promises = chunks.map(
					(chunk) =>
						new Promise<ChangeRequest[]>((resolve, reject) => {
							const worker = new Worker(
								new URL("./github.worker.ts", import.meta.url),
							);
							worker.postMessage({
								prs: chunk,
								config,
								repo,
								me,
								token: this.token,
							});
							worker.on("message", (msg) => {
								if (msg.error) {
									reject(msg.error);
								} else {
									resolve(msg.results);
								}
								worker.terminate();
							});
							worker.on("error", reject);
						}),
				);
				const chunkResults = await Promise.all(promises);
				return chunkResults.flat();
			})(),
			(error) => error as GHPullReviewsError,
		);
	}

	private mapGitHubPR(
		repo: RepoRef,
		me: UserRef | null,
		pr: GitHubPR,
		reviews: Reviews,
	): ChangeRequest {
		const requested = (pr.requested_reviewers ?? []).map((u) =>
			String(u.login).toLowerCase(),
		);
		const meLogin = me?.login?.toLowerCase();
		const myLatest = meLogin
			? pickMyLatestDecision(meLogin, reviews)
			: undefined;
		const isMyPR = Boolean(
			meLogin && pr.user && meLogin === pr.user.login.toLowerCase(),
		);

		const activeReviews = reviews.filter((r) => r.state !== "DISMISSED");
		const overallStatus = computeOverallStatus(activeReviews);
		const hasComments = Boolean(reviews.some((r) => r.state === "COMMENTED"));
		const hasAnyReviewActivity: boolean =
			overallStatus !== "none" || hasComments;

		const myStatus = computeMyStatus(
			myLatest,
			requested,
			overallStatus,
			meLogin,
		);

		return {
			id: { owner: repo.owner, repo: repo.repo, number: pr.number },
			title: pr.title,
			author: pr.user ? { login: pr.user.login } : { login: "unknown" },
			taget: pr.base.ref,
			branch: pr.head.ref,
			state: pr.merged_at
				? "merged"
				: pr.state === "closed"
					? "closed"
					: "open",
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
}
