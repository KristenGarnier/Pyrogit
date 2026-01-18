import type { Octokit } from "@octokit/rest";
import type { CurrentUserProvider } from "../../../application/ports/user.provider";
import type { UserRef } from "../../../domain/change-request";
import { withAbort } from "../../react/src/utils/abort-request.utils";

export class GitHubCurrentUserProvider implements CurrentUserProvider {
	constructor(private readonly octokit: Octokit) {}

	async getCurrentUser(): Promise<UserRef | null> {
		try {
			const res = await withAbort((signal) =>
				this.octokit.users.getAuthenticated({
					request: {
						signal,
					},
				}),
			);
			return { login: res.data.login };
		} catch {
			return null;
		}
	}
}
