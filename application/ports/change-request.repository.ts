import type { Result } from "neverthrow";
import type {
	ChangeRequest,
	ChangeRequestId,
} from "../../domain/change-request";
import type { ChangeRequestQuery } from "../../domain/change-request-query";
import type { TaggedError } from "../../infrastructure/errors/TaggedError";

export type RepoRef = { owner: string; repo: string };

export interface ChangeRequestRepository {
	list(
		repo: RepoRef,
		query: ChangeRequestQuery,
	): Promise<Result<ChangeRequest[], Error | TaggedError>>;
	listClosed(
		repo: RepoRef,
		query: ChangeRequestQuery,
	): Promise<Result<ChangeRequest[], Error | TaggedError>>;
	getById(id: ChangeRequestId): Promise<Result<ChangeRequest, Error>>;
}
