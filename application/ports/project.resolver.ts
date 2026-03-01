import type { Result } from "neverthrow";
import type { RepoRef } from "./change-request.repository";

export interface RepoResolver {
  resolveCurrentRepo(): Promise<Result<RepoRef, Error>>; // via git remote, config, CLI...
}
