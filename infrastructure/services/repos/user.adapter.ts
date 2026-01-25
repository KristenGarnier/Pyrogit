import type { Octokit } from "@octokit/rest";
import { ok, type Result, ResultAsync } from "neverthrow";
import type { CurrentUserProvider } from "../../../application/ports/user.provider";
import type { UserRef } from "../../../domain/change-request";
import { withAbort } from "../../react/src/utils/abort-request.utils";

export class GitHubCurrentUserProvider implements CurrentUserProvider {
	constructor(private readonly octokit: Octokit) {}

	async getCurrentUser(): Promise<Result<UserRef, Error>> {
		const result = ResultAsync.fromPromise(
			withAbort((signal) =>
				this.octokit.users.getAuthenticated({
					request: {
						signal,
					},
				}),
			),
			(error: unknown) =>
				new Error("Could not login the user", { cause: error }),
		);

		return result.andThen((result) => {
			return ok({
				login: result.data.login,
			} as UserRef);
		});
	}
}
