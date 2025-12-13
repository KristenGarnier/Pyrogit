import type {
	ChangeRequest,
	ChangeRequestId,
} from "../../domain/change-request";
import type { ChangeRequestQuery } from "../../domain/change-request-query";

export interface ChangeRequestUseCase {
	/**
	 * Liste les Change Requests (PR/MR)
	 * selon les filtres / tris métier
	 */
	list(query: ChangeRequestQuery): Promise<ChangeRequest[]>;

	/**
	 * Détail d’une Change Request
	 */
	getById(id: ChangeRequestId): Promise<ChangeRequest>;

	checkAuth(): Promise<boolean>;
}
