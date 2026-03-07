import { describe, expect, it } from "bun:test";
import type { ChangeRequest, UserRef } from "../domain/change-request";
import {
	RefreshChangeRequestsCommand,
	RefreshChangeRequestsCommandHandler,
} from "../infrastructure/react/src/commands/refresh-change-requests.command";

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

describe("RefreshChangeRequestsCommandHandler", () => {
	it("refreshes pull requests and loads user if missing", async () => {
		const storedPRs: ChangeRequest[] = [createChangeRequest(99)];
		let storedUser: UserRef | null = null;
		let storedUserLogin = "";

		const handler = new RefreshChangeRequestsCommandHandler({
			changeRequestStore: {
				getPRs: () => storedPRs,
				upsertPRs: (prs) => {
					storedPRs.splice(0, storedPRs.length, ...prs);
				},
				deletePRs: (prs) => {
					const ids = prs.map((pr) => pr.id.number);
					const filtered = storedPRs.filter((pr) => !ids.includes(pr.id.number));
					storedPRs.splice(0, storedPRs.length, ...filtered);
				},
			},
			userStore: {
				getUser: () => storedUser,
				setUser: (user) => {
					storedUser = user;
					storedUserLogin = user.login;
				},
			},
		});

		const command = new RefreshChangeRequestsCommand({
			list: async () => [createChangeRequest(1), createChangeRequest(2)],
			listClosed: async () => [createChangeRequest(1)],
			getUser: async () => ({ login: "alice" }),
		} as never);

		const result = await handler.execute(command);

		expect(result.isOk()).toBe(true);
		const outcome = result._unsafeUnwrap();
		expect(outcome.data.updatedCount).toBe(2);
		expect(outcome.data.closedCount).toBe(1);
		expect(outcome.data.userLoaded).toBe(true);
		expect(storedUser).not.toBeNull();
		expect(storedUserLogin).toBe("alice");
		expect(outcome.notices.some((n) => n.message === "Pull requests loaded successfully")).toBe(
			true,
		);
	});

	it("returns info notice when no PR is returned", async () => {
		const handler = new RefreshChangeRequestsCommandHandler({
			changeRequestStore: {
				getPRs: () => [],
				upsertPRs: () => {},
				deletePRs: () => {},
			},
			userStore: {
				getUser: () => ({ login: "already-set" }),
				setUser: () => {},
			},
		});

		const command = new RefreshChangeRequestsCommand({
			list: async () => [],
			listClosed: async () => [],
			getUser: async () => ({ login: "already-set" }),
		} as never);

		const result = await handler.execute(command);

		expect(result.isOk()).toBe(true);
		const outcome = result._unsafeUnwrap();
		expect(outcome.data.updatedCount).toBe(0);
		expect(outcome.notices.some((n) => n.level === "info")).toBe(true);
	});

	it("returns an error result when service list fails", async () => {
		let upsertCalled = false;
		let deleteCalled = false;

		const handler = new RefreshChangeRequestsCommandHandler({
			changeRequestStore: {
				getPRs: () => [],
				upsertPRs: () => {
					upsertCalled = true;
				},
				deletePRs: () => {
					deleteCalled = true;
				},
			},
			userStore: {
				getUser: () => null,
				setUser: () => {},
			},
		});

		const command = new RefreshChangeRequestsCommand({
			list: async () => {
				throw new Error("list failed");
			},
			listClosed: async () => [],
			getUser: async () => null,
		} as never);

		const result = await handler.execute(command);

		expect(result.isErr()).toBe(true);
		expect(result._unsafeUnwrapErr().message).toBe("list failed");
		expect(upsertCalled).toBe(false);
		expect(deleteCalled).toBe(false);
	});
});
