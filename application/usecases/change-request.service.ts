import type {
	ChangeRequest,
	ChangeRequestId,
} from "../../domain/change-request";
import type { ChangeRequestQuery } from "../../domain/change-request-query";
import type { ChangeRequestRepository } from "../ports/change-request.repository";
import type { RepoResolver } from "../ports/project.resolver.ts";
import type { CurrentUserProvider } from "../ports/user.provider";
import type { ChangeRequestUseCase } from "./change-request.interface";

type Deps = {
	repoResolver: RepoResolver;
	repository: ChangeRequestRepository;
	currentUserProvider: CurrentUserProvider;
};

export class ChangeRequestService implements ChangeRequestUseCase {
	constructor(private readonly deps: Deps) {}

	async list(query: ChangeRequestQuery): Promise<ChangeRequest[]> {
		const repo = await this.deps.repoResolver.resolveCurrentRepo();
		const me = await this.deps.currentUserProvider.getCurrentUser();

		const items = await this.deps.repository.list(repo, query);

		// Filtres/tri métier (un minimum)
		let out = items.slice();

		const f = query.filter;
		if (f?.state?.length) {
			const allowed = new Set(f.state);
			out = out.filter((x) => allowed.has(x.state));
		}

		if (f?.needsMyReview === true) {
			// si "me" inconnu, on ne filtre pas (sinon tu caches des PR par erreur)
			if (me) out = out.filter((x) => x.review.myStatus.kind === "needed");
		}

		if (query.sort)
			switch (query.sort ?? "updated_desc") {
				case "updated_asc":
					out.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
					break;
				case "updated_desc":
					out.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
					break;
			}

		if (query.limit && query.limit > 0) out = out.slice(0, query.limit);
		return out;
	}

	async getById(id: ChangeRequestId): Promise<ChangeRequest> {
		return this.deps.repository.getById(id);
	}

	async checkAuth(): Promise<boolean> {
		const result = await this.deps.currentUserProvider.getCurrentUser();
		if (!result) throw new Error("Token is not correct");
		return true;
	}

	async getUser() {
		return this.deps.currentUserProvider.getCurrentUser();
	}
}
