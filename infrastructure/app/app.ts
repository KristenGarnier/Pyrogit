import { Octokit } from "@octokit/rest";
import { ChangeRequestService } from "../../application/usecases/change-request.service";
import { GitHubChangeRequestRepository } from "../services/repos/github/github.adapter";
import { GitRemoteRepoResolver } from "../services/repos/resolver.adapter";
import { GitHubCurrentUserProvider } from "../services/repos/user.adapter";

const silentLogger = {
	debug: () => {},
	info: () => {},
	warn: () => {},
	error: () => {},
};

export function init(token: string) {
	const octokit = new Octokit({ auth: token, log: silentLogger });

	const repoResolver = new GitRemoteRepoResolver({ remoteName: "origin" });
	const currentUserProvider = new GitHubCurrentUserProvider(octokit);

	const repository = new GitHubChangeRequestRepository(token, () =>
		currentUserProvider.getCurrentUser(),
	);

	return new ChangeRequestService({
		repoResolver,
		repository,
		currentUserProvider,
	});
}
