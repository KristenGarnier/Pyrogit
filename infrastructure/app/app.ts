import { Octokit } from "@octokit/rest";
import { ChangeRequestService } from "../../application/usecases/change-request.service";
import { GitHubChangeRequestRepository } from "../services/repos/github/github.adapter";
import { GitRemoteRepoResolver } from "../services/repos/resolver.adapter";
import { GitHubCurrentUserProvider } from "../services/repos/user.adapter";
import { FileStorage } from "../services/storage/file.storage";
import { AppDirectories } from "../services/storage/locator.storage";
import * as path from "node:path";

const silentLogger = {
	debug: () => {},
	info: () => {},
	warn: () => {},
	error: () => {},
};

export async function init(token: string) {
	const octokit = new Octokit({ auth: token, log: silentLogger });

	const repoResolver = new GitRemoteRepoResolver({ remoteName: "origin" });
	const currentUserProvider = new GitHubCurrentUserProvider(octokit);

	const repository = new GitHubChangeRequestRepository(token, () =>
		currentUserProvider.getCurrentUser(),
	);

	const configDir = new AppDirectories("pyrogit").getPath("cache");
	const lastRunFile = path.join(configDir, "last-run.json");
	const storage = new FileStorage(lastRunFile);

	return new ChangeRequestService({
		repoResolver,
		repository,
		currentUserProvider,
		storage,
	});
}
