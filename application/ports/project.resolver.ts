import type { RepoRef } from "./change-request.repository";

export interface RepoResolver {
	resolveCurrentRepo(): Promise<RepoRef>; // via git remote, config, CLI...
}
