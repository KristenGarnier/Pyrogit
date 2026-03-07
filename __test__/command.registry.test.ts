import { describe, expect, it } from "bun:test";
import { ok } from "neverthrow";
import type { ChangeRequestService } from "../application/usecases/change-request.service";
import type { ChangeRequest, UserRef } from "../domain/change-request";
import { InitAppCommand } from "../infrastructure/react/src/commands/init-app.command";
import {
	RefreshChangeRequestsCommand,
} from "../infrastructure/react/src/commands/refresh-change-requests.command";
import { createAppCommandBus } from "../infrastructure/react/src/commands/registry";

function createChangeRequest(number: number) {
	return {
		id: { owner: "owner", repo: "repo", number },
		title: `PR ${number}`,
		taget: "main",
		branch: `feature/${number}`,
		author: { login: "author" },
		state: "open" as const,
		isDraft: false,
		updatedAt: new Date("2024-01-01T00:00:00.000Z"),
		webUrl: `https://example.com/pr/${number}`,
		review: {
			hasAnyReviewActivity: false,
			myStatus: { kind: "not_needed" as const },
			overallStatus: "none" as const,
			hasComments: false,
			isMyPR: false,
		},
	};
}

describe("createAppCommandBus", () => {
	it("registers init and refresh command handlers", async () => {
		const fakeService = {
			list: async () => [createChangeRequest(1)],
			listClosed: async () => [],
			getUser: async () => ({ login: "alice" }),
		} as never as ChangeRequestService;

		const themeStore = { hydrate: async () => {} };
		const changeRequestStore = {
			prs: [] as ChangeRequest[],
			hydrate: async () => {},
			upsertPRs: (prs: ChangeRequest[]) => {
				changeRequestStore.prs = prs;
			},
			deletePRs: (_prs: ChangeRequest[]) => {},
		};
		const userStore = {
			user: null as UserRef | null,
			hydrate: async () => {},
			set: (user: UserRef) => {
				userStore.user = user;
			},
		};

		const commandBus = createAppCommandBus({
			pyrogit: {
				init: async () => ok(fakeService),
			},
			getThemeStore: () => themeStore,
			getChangeRequestStore: () => changeRequestStore,
			getUserStore: () => userStore,
		});

		const initResult = await commandBus.execute(new InitAppCommand());
		expect(initResult.isOk()).toBe(true);

		const refreshResult = await commandBus.execute(new RefreshChangeRequestsCommand(fakeService));
		expect(refreshResult.isOk()).toBe(true);
		expect(changeRequestStore.prs).toHaveLength(1);
		expect(userStore.user?.login).toBe("alice");
	});
});
