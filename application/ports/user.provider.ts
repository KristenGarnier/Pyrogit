import type { Result } from "neverthrow";
import type { UserRef } from "../../domain/change-request";

export interface CurrentUserProvider {
	getCurrentUser(): Promise<Result<UserRef, Error>>; // GitHub /user
}
