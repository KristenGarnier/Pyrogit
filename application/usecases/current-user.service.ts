import { err, ok, Result, type Result as ResultType } from "neverthrow";
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

	get(): ResultType<UserRef | null, Error> {
		return ok(this.currentUser);
	}

	async hydrate(): Promise<ResultType<UserRef | null, Error>> {
		if (this.hydrated) return ok(this.currentUser);

		const result = await this.deps.storage.read();
		this.hydrated = true;

		if (result.isErr()) {
			this.currentUser = null;
			return ok(null);
		}

		const parsedResult = Result.fromThrowable(
			() => JSON.parse(result.value) as unknown,
			(error) => new Error("Could not parse current user from storage", { cause: error }),
		)();
		if (parsedResult.isErr()) {
			this.currentUser = null;
			return err(parsedResult.error);
		}

		this.currentUser = isUserRef(parsedResult.value) ? parsedResult.value : null;
		return ok(this.currentUser);
	}

	async set(user: UserRef): Promise<ResultType<UserRef, Error>> {
		this.currentUser = user;
		this.hydrated = true;
		const result = await this.deps.storage.write(JSON.stringify(user));
		if (result.isErr()) return err(result.error);

		return ok(user);
	}

	async reset(): Promise<ResultType<null, Error>> {
		this.currentUser = null;
		this.hydrated = true;
		const result = await this.deps.storage.write("null");
		if (result.isErr()) return err(result.error);

		return ok(null);
	}
}
