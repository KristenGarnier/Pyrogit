import type { UserRef } from "../../domain/change-request";

export interface CurrentUserProvider {
	getCurrentUser(): Promise<UserRef | null>; // GitHub /user
}
