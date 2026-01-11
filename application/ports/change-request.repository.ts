import type { Result } from "neverthrow";
import type {
	ChangeRequest,
	ChangeRequestId,
} from "../../domain/change-request";
import type { ChangeRequestQuery } from "../../domain/change-request-query";

export type RepoRef = { owner: string; repo: string };

export interface ChangeRequestRepository {
	list(
		repo: RepoRef,
		query: ChangeRequestQuery,
	): Promise<Result<ChangeRequest[], Error>>;
	getById(id: ChangeRequestId): Promise<Result<ChangeRequest, Error>>;
}
