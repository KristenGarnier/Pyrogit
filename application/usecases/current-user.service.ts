import { err, ok, type Result } from "neverthrow";
import type { UserRef } from "../../domain/change-request";
import type { Storage } from "../../infrastructure/services/storage/storage.interface";

type Deps = {
	storage: Storage<string>;
};

function isUserRef(value: unknown): value is UserRef {
	if (!value || typeof value !== "object") return false;
	if (!("login" in value)) return false;

	return typeof value.login === "string";
}

export class CurrentUserService {
	private hydrated = false;
	private currentUser: UserRef | null = null;

	constructor(private readonly deps: Deps) {}

	get(): Result<UserRef | null, Error> {
		return ok(this.currentUser);
	}

	async hydrate(): Promise<Result<UserRef | null, Error>> {
		if (this.hydrated) return ok(this.currentUser);

		const result = await this.deps.storage.read();
		this.hydrated = true;

		if (result.isErr()) {
			this.currentUser = null;
			return ok(null);
		}

		try {
			const parsed = JSON.parse(result.value) as unknown;
			this.currentUser = isUserRef(parsed) ? parsed : null;
			return ok(this.currentUser);
		} catch (error: unknown) {
			const e = error instanceof Error ? error : new Error(String(error));
			this.currentUser = null;
			return err(
				new Error("Could not parse current user from storage", { cause: e }),
			);
		}
	}

	async set(user: UserRef): Promise<Result<UserRef, Error>> {
		this.currentUser = user;
		this.hydrated = true;
		const result = await this.deps.storage.write(JSON.stringify(user));
		if (result.isErr()) return err(result.error);

		return ok(user);
	}

	async reset(): Promise<Result<null, Error>> {
		this.currentUser = null;
		this.hydrated = true;
		const result = await this.deps.storage.write("null");
		if (result.isErr()) return err(result.error);

		return ok(null);
	}
}
