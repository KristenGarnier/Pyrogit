import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { err, ok, ResultAsync, type Result } from "neverthrow";
import type { RepoRef } from "../../../application/ports/change-request.repository";
import type { RepoResolver } from "../../../application/ports/project.resolver";
import { RemoteCMDError } from "../../errors/RemoteCMDError";
import { RemoteNoResultError } from "../../errors/RemoteNoResultError";

const execFileAsync = promisify(execFile);

/**
 * Résout le repo GitHub courant à partir de "git remote -v".
 * Supporte :
 *  - git@github.com:owner/repo.git
 *  - ssh://git@github.com/owner/repo.git
 *  - https://github.com/owner/repo.git
 */
export class GitRemoteRepoResolver implements RepoResolver {
	constructor(
		private readonly opts: {
			cwd?: string;
			remoteName?: string;
			preferHttps?: boolean;
		} = {},
	) {}

	async resolveCurrentRepo(): Promise<
		Result<RepoRef, RemoteCMDError | RemoteNoResultError>
	> {
		const cwd = this.opts.cwd;

		const result = await ResultAsync.fromPromise(
			execFileAsync("git", ["remote", "-v"], { cwd }),
			(error) =>
				new RemoteCMDError(
					"Could not get the remote from the current directory",
					{ cause: error },
				),
		);
		if (result.isErr()) return err(result.error);

		const candidates = parseGitRemoteV(result.value.stdout);

		const remoteName = this.opts.remoteName ?? "origin";

		const fromPreferredRemote = candidates.filter(
			(c) => c.remote === remoteName,
		);
		const pool = fromPreferredRemote.length ? fromPreferredRemote : candidates;

		const github = pool
			.map((c) => ({ ...c, repo: parseGitHubRepoFromRemoteUrl(c.url) }))
			.filter((x) => x.repo !== null) as Array<{
			remote: string;
			url: string;
			type: string;
			repo: RepoRef;
		}>;

		if (!github[0]) {
			return err(
				new RemoteNoResultError(
					"Cannot dectect user from command, are you sure you are in a git repo ?",
				),
			);
		}

		if (this.opts.preferHttps) {
			const https = github.find((x) => x.url.startsWith("https://"));
			if (https) return ok(https.repo);
		}

		return ok(github[0].repo);
	}
}

function parseGitRemoteV(
	stdout: string,
): Array<{ remote: string; url: string; type: string }> {
	// lignes typiques :
	// origin  git@github.com:owner/repo.git (fetch)
	// origin  git@github.com:owner/repo.git (push)
	const lines = stdout
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

	const out: Array<{ remote: string; url: string; type: string }> = [];

	for (const line of lines) {
		const m = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
		if (!m) continue;
		out.push({ remote: m[1]!, url: m[2]!, type: m[3]! });
	}

	// petit dédoublonnage (fetch/push identiques)
	const uniq = new Map<string, { remote: string; url: string; type: string }>();
	for (const x of out) {
		uniq.set(`${x.remote}:${x.url}`, x);
	}
	return [...uniq.values()];
}

/**
 * Retourne { owner, repo } si l'URL est GitHub, sinon null.
 */
export function parseGitHubRepoFromRemoteUrl(url: string): RepoRef | null {
	// SSH scp-like: git@github.com:owner/repo.git
	let m = url.match(/^git@github\.com:([^/]+)\/(.+?)(\.git)?$/);
	if (m) return { owner: m[1]!, repo: m[2]! };

	// SSH url: ssh://git@github.com/owner/repo.git
	m = url.match(/^ssh:\/\/git@github\.com\/([^/]+)\/(.+?)(\.git)?$/);
	if (m) return { owner: m[1]!, repo: m[2]! };

	// HTTPS: https://github.com/owner/repo.git
	m = url.match(/^https:\/\/github\.com\/([^/]+)\/(.+?)(\.git)?$/);
	if (m) return { owner: m[1]!, repo: m[2]! };

	return null;
}
