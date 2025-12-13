import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { RepoRef } from "../../../application/ports/change-request.repository";
import type { RepoResolver } from "../../../application/ports/project.resolver";

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
			cwd?: string; // dossier du projet
			remoteName?: string; // par défaut "origin"
			preferHttps?: boolean; // si plusieurs remotes matchent
		} = {},
	) {}

	async resolveCurrentRepo(): Promise<RepoRef> {
		const cwd = this.opts.cwd;

		const { stdout } = await execFileAsync("git", ["remote", "-v"], { cwd });
		const candidates = parseGitRemoteV(stdout);

		const remoteName = this.opts.remoteName ?? "origin";

		// 1) on prend d'abord le remoteName (origin) si possible
		const fromPreferredRemote = candidates.filter(
			(c) => c.remote === remoteName,
		);

		// 2) sinon on prend tout
		const pool = fromPreferredRemote.length ? fromPreferredRemote : candidates;

		// 3) on garde uniquement github.com
		const github = pool
			.map((c) => ({ ...c, repo: parseGitHubRepoFromRemoteUrl(c.url) }))
			.filter((x) => x.repo !== null) as Array<{
			remote: string;
			url: string;
			type: string;
			repo: RepoRef;
		}>;

		if (!github[0]) {
			throw new Error(
				`Impossible de détecter un repo GitHub depuis "git remote -v". ` +
					`Vérifie que tu es dans un repo git et que le remote pointe vers github.com.`,
			);
		}

		// Optionnel : préférer HTTPS si demandé
		if (this.opts.preferHttps) {
			const https = github.find((x) => x.url.startsWith("https://"));
			if (https) return https.repo;
		}

		// Sinon: premier match stable
		return github[0].repo;
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
