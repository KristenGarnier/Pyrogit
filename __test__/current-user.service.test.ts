import { describe, expect, it } from "bun:test";
import { err, ok } from "neverthrow";
import { CurrentUserService } from "../application/usecases/current-user.service";
import type { Storage } from "../infrastructure/services/storage/storage.interface";

class InMemoryStorage implements Storage<string> {
	constructor(private content: string | null = null) {}

	async read() {
		if (this.content === null) return err(new Error("not found"));
		return ok(this.content);
	}

	async write(content: string) {
		this.content = content;
		return ok(true);
	}
}

describe("CurrentUserService", () => {
	it("hydrates persisted user", async () => {
		const storage = new InMemoryStorage(JSON.stringify({ login: "alice" }));
		const service = new CurrentUserService({ storage });

		const user = await service.hydrate();
		const currentUser = service.get();

		expect(user.isOk()).toBe(true);
		expect(user._unsafeUnwrap()).toEqual({ login: "alice" });
		expect(currentUser.isOk()).toBe(true);
		expect(currentUser._unsafeUnwrap()).toEqual({ login: "alice" });
	});

	it("returns null when persisted content is invalid", async () => {
		const storage = new InMemoryStorage("not-json");
		const service = new CurrentUserService({ storage });

		const user = await service.hydrate();
		const currentUser = service.get();

		expect(user.isErr()).toBe(true);
		expect(currentUser.isOk()).toBe(true);
		expect(currentUser._unsafeUnwrap()).toBeNull();
	});

	it("stores user through set", async () => {
		const storage = new InMemoryStorage();
		const service = new CurrentUserService({ storage });

		const writeResult = await service.set({ login: "bob" });

		expect(writeResult.isOk()).toBe(true);
		expect(service.get()._unsafeUnwrap()).toEqual({ login: "bob" });
		const hydrated = await service.hydrate();
		expect(hydrated.isOk()).toBe(true);
		expect(hydrated._unsafeUnwrap()).toEqual({ login: "bob" });
	});

	it("clears user through reset", async () => {
		const storage = new InMemoryStorage(JSON.stringify({ login: "carol" }));
		const service = new CurrentUserService({ storage });

		await service.hydrate();
		const resetResult = await service.reset();

		expect(resetResult.isOk()).toBe(true);
		expect(service.get()._unsafeUnwrap()).toBeNull();
	});
});
