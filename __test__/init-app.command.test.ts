import { describe, expect, it } from "bun:test";
import { err, ok } from "neverthrow";
import type { ChangeRequestService } from "../application/usecases/change-request.service";
import { GHTokenRetrievalError } from "../infrastructure/errors/GHTokenRetrievalError";
import { InitAppCommand, InitAppCommandHandler } from "../infrastructure/react/src/commands/init-app.command";

function createHydratableStore() {
	let callCount = 0;

	return {
		store: {
			hydrate: async () => {
				callCount += 1;
			},
		},
		getCallCount: () => callCount,
	};
}

describe("InitAppCommandHandler", () => {
	it("hydrates all stores then initializes pyrogit", async () => {
		const theme = createHydratableStore();
		const prs = createHydratableStore();
		const user = createHydratableStore();
		const fakeService = {} as ChangeRequestService;

		const handler = new InitAppCommandHandler({
			themeStore: theme.store,
			changeRequestStore: prs.store,
			userStore: user.store,
			pyrogit: {
				init: async () => ok(fakeService),
			},
		});

		const result = await handler.execute(new InitAppCommand());

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap().data.service).toBe(fakeService);
		expect(theme.getCallCount()).toBe(1);
		expect(prs.getCallCount()).toBe(1);
		expect(user.getCallCount()).toBe(1);
	});

	it("returns init error from pyrogit", async () => {
		const handler = new InitAppCommandHandler({
			themeStore: { hydrate: async () => {} },
			changeRequestStore: { hydrate: async () => {} },
			userStore: { hydrate: async () => {} },
			pyrogit: {
				init: async () => err(new GHTokenRetrievalError("missing token")),
			},
		});

		const result = await handler.execute(new InitAppCommand());

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr()).toBeInstanceOf(GHTokenRetrievalError);
	});
});
