import { err, ok, Result, type Result as ResultType } from "neverthrow";
import type { ChangeRequest } from "../../domain/change-request";
import type { Storage } from "../../infrastructure/services/storage/storage.interface";

type Deps = {
	storage: Storage<string>;
};

type PersistedChangeRequest = Omit<ChangeRequest, "updatedAt"> & {
	updatedAt: string;
};

function getChangeRequestNumber(pr: Partial<ChangeRequest> | null | undefined): number | null {
	if (!pr || typeof pr !== "object") return null;
	if (!pr.id || typeof pr.id !== "object") return null;
	if (typeof pr.id.number !== "number") return null;

	return pr.id.number;
}

function normalizeUpdatedAtForPersistence(value: unknown): string {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;

	return new Date(0).toISOString();
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function toDate(value: unknown): ResultType<Date, Error> {
	if (value instanceof Date) return ok(value);
	if (typeof value !== "string") return err(new Error("updatedAt is not a string"));

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return err(new Error("updatedAt is not a valid date"));
	}

	return ok(date);
}

function toChangeRequest(value: unknown): ResultType<ChangeRequest, Error> {
	if (!isObject(value)) return err(new Error("Persisted change request is invalid"));
	if (!isObject(value.id) || typeof value.id.number !== "number") {
		return err(new Error("Persisted change request id is invalid"));
	}

	const dateResult = toDate(value.updatedAt);
	if (dateResult.isErr()) return err(dateResult.error);

	return ok({
		...(value as Omit<ChangeRequest, "updatedAt">),
		updatedAt: dateResult.value,
	});
}

function parsePersistedArray(raw: unknown): ResultType<ChangeRequest[], Error> {
	if (!Array.isArray(raw)) return err(new Error("Persisted PR payload is not an array"));

	const prs: ChangeRequest[] = [];
	for (const item of raw) {
		const parsed = toChangeRequest(item);
		if (parsed.isErr()) return err(parsed.error);
		prs.push(parsed.value);
	}

	return ok(prs);
}

function selectPersistedData(payload: unknown): unknown {
	if (Array.isArray(payload)) return payload;
	if (!isObject(payload)) return payload;

	if (isObject(payload.state) && Array.isArray(payload.state.prs)) {
		return payload.state.prs;
	}

	if (Array.isArray(payload.prs)) return payload.prs;

	return payload;
}

export class ChangeRequestCacheService {
	private hydrated = false;
	private prs: ChangeRequest[] = [];

	constructor(private readonly deps: Deps) {}

	get(): Result<ChangeRequest[], Error> {
		return ok(this.prs.slice());
	}

	async hydrate(): Promise<ResultType<ChangeRequest[], Error>> {
		if (this.hydrated) return ok(this.prs.slice());

		const readResult = await this.deps.storage.read();
		this.hydrated = true;

		if (readResult.isErr() || !readResult.value) {
			this.prs = [];
			return ok([]);
		}

		const parsedPayload = Result.fromThrowable(
			() => JSON.parse(readResult.value),
			(error) =>
				new Error("Could not parse persisted change requests", {
					cause: error,
				}),
		)();

		if (parsedPayload.isErr()) return err(parsedPayload.error);

		const prsResult = parsePersistedArray(selectPersistedData(parsedPayload.value));
		if (prsResult.isErr()) return err(prsResult.error);

		this.prs = prsResult.value;
		return ok(this.prs.slice());
	}

	setPRs(prs: ChangeRequest[]): ResultType<ChangeRequest[], Error> {
		this.prs = prs.slice();
		this.persist();
		return ok(this.prs.slice());
	}

	upsertPR(pr: ChangeRequest): ResultType<ChangeRequest[], Error> {
		const number = getChangeRequestNumber(pr);
		if (number === null) return ok(this.prs.slice());

		const index = this.prs.findIndex((item) => item.id.number === number);
		if (index === -1) {
			this.prs = [...this.prs, pr];
			this.persist();
			return ok(this.prs.slice());
		}

		const next = this.prs.slice();
		next[index] = pr;
		this.prs = next;
		this.persist();

		return ok(this.prs.slice());
	}

	upsertPRs(prs: ChangeRequest[]): ResultType<ChangeRequest[], Error> {
		const seen = new Set<number>();
		const uniquePRs = prs.filter((pr) => {
			const number = getChangeRequestNumber(pr);
			if (number === null) return false;
			if (seen.has(number)) return false;
			seen.add(number);
			return true;
		});

		const numbers = uniquePRs.map((pr) => pr.id.number);
		this.prs = this.prs
			.filter((pr) => !numbers.includes(pr.id.number))
			.concat(uniquePRs)
			.sort((a, b) => b.id.number - a.id.number);

		this.persist();
		return ok(this.prs.slice());
	}

	deletePRs(prs: ChangeRequest[]): ResultType<ChangeRequest[], Error> {
		const numbers = prs
			.map((pr) => getChangeRequestNumber(pr))
			.filter((number): number is number => number !== null);
		this.prs = this.prs.filter((pr) => !numbers.includes(pr.id.number));
		this.persist();

		return ok(this.prs.slice());
	}

	clearPRs(): ResultType<ChangeRequest[], Error> {
		this.prs = [];
		this.persist();

		return ok([]);
	}

	private persist() {
		const persisted: PersistedChangeRequest[] = this.prs.map((pr) => ({
			...pr,
			updatedAt: normalizeUpdatedAtForPersistence(pr.updatedAt),
		}));

		void this.deps.storage.write(JSON.stringify(persisted));
	}
}
