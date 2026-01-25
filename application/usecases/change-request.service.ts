import type {
	ChangeRequest,
	ChangeRequestId,
} from "../../domain/change-request";
import type { ChangeRequestQuery } from "../../domain/change-request-query";
import type { ChangeRequestRepository } from "../ports/change-request.repository";
import type { RepoResolver } from "../ports/project.resolver.ts";
import type { CurrentUserProvider } from "../ports/user.provider";
import type { ChangeRequestUseCase } from "./change-request.interface";

import type { Storage } from "../../infrastructure/services/storage/storage.interface";
import { Result } from "neverthrow";

type Deps = {
	repoResolver: RepoResolver;
	repository: ChangeRequestRepository;
	currentUserProvider: CurrentUserProvider;
	storage: Storage<string>;
};

export class ChangeRequestService implements ChangeRequestUseCase {
	constructor(private readonly deps: Deps) {}

	async list(query: ChangeRequestQuery): Promise<ChangeRequest[]> {
		const [repoResult, me, readResult] = await Promise.all([
			this.deps.repoResolver.resolveCurrentRepo(),
			this.deps.currentUserProvider.getCurrentUser(),
			this.deps.storage.read(),
		]);

		if (repoResult.isErr()) throw repoResult.error;
		if (me.isErr()) throw me.error;

		const repo = repoResult.value;
		if (readResult.isOk()) {
			const resultNewDate = Result.fromThrowable(
				() => new Date(readResult.value),
				(error) => new Error("Date could not be parsed", { cause: error }),
			)();

			if (resultNewDate.isErr()) throw resultNewDate.error;
			query.since = resultNewDate.value;
		}

		const itemsResult = await this.deps.repository.list(repo, query);
		if (itemsResult.isErr()) throw itemsResult.error;
		const items = itemsResult.value;

		// Update last run after successful fetch
		// Does not need to block the thread
		this.deps.storage.write(new Date().toISOString());

		let out = items.slice();

		const f = query.filter;
		if (f?.state?.length) {
			const allowed = new Set(f.state);
			out = out.filter((x) => allowed.has(x.state));
		}

		if (f?.needsMyReview === true) {
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

	async listClosed(query: ChangeRequestQuery): Promise<ChangeRequest[]> {
		const [repoResult, readResult] = await Promise.all([
			this.deps.repoResolver.resolveCurrentRepo(),
			this.deps.storage.read(),
		]);

		if (repoResult.isErr()) throw repoResult.error;

		const repo = repoResult.value;
		if (readResult.isOk()) {
			const resultNewDate = Result.fromThrowable(
				() => new Date(readResult.value),
				(error) => new Error("Date could not be parsed", { cause: error }),
			)();

			if (resultNewDate.isErr()) throw resultNewDate.error;
			query.since = resultNewDate.value;
		}

		const itemsResult = await this.deps.repository.listClosed(repo, query);
		if (itemsResult.isErr()) throw itemsResult.error;
		const items = itemsResult.value;

		// Update last run after successful fetch
		// Does not need to block the thread
		this.deps.storage.write(new Date().toISOString());

		return items;
	}

	async getById(id: ChangeRequestId): Promise<ChangeRequest> {
		const result = await this.deps.repository.getById(id);
		if (result.isErr()) throw result.error;
		return result.value;
	}

	async checkAuth(): Promise<boolean> {
		const result = await this.deps.currentUserProvider.getCurrentUser();
		if (result.isErr()) throw new Error("Token is not correct");
		return true;
	}

	async getUser() {
		const me = await this.deps.currentUserProvider.getCurrentUser();
		if (me.isErr()) return null;
		return me.value;
	}
}
