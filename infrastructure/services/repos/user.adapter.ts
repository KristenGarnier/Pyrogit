import type { Octokit } from "@octokit/rest";
import type { CurrentUserProvider } from "../../../application/ports/user.provider";
import type { UserRef } from "../../../domain/change-request";

export class GitHubCurrentUserProvider implements CurrentUserProvider {
	constructor(private readonly octokit: Octokit) {}

	async getCurrentUser(): Promise<UserRef | null> {
		try {
			const res = await this.octokit.users.getAuthenticated();
			return { login: res.data.login };
		} catch {
			return null;
		}
	}
}
