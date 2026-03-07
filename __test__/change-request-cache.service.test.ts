import { describe, expect, it } from "bun:test";
import { err, ok } from "neverthrow";
import { ChangeRequestCacheService } from "../application/usecases/change-request-cache.service";
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

function createMockPR(number: number) {
	return {
		id: { number, owner: "owner", repo: "repo" },
		title: `PR ${number}`,
		taget: "main",
		branch: `feature/${number}`,
		author: { login: `user${number}` },
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

describe("ChangeRequestCacheService", () => {
	it("hydrates legacy zustand payload", async () => {
		const persisted = {
			state: {
				prs: [
					{
						...createMockPR(1),
						updatedAt: "2024-01-01T00:00:00.000Z",
					},
				],
			},
		};

		const service = new ChangeRequestCacheService({
			storage: new InMemoryStorage(JSON.stringify(persisted)),
		});

		const result = await service.hydrate();

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toHaveLength(1);
		expect(result._unsafeUnwrap()[0]?.updatedAt instanceof Date).toBe(true);
	});

	it("upserts and keeps descending order by number", () => {
		const service = new ChangeRequestCacheService({
			storage: new InMemoryStorage(),
		});

		const result = service.upsertPRs([createMockPR(2), createMockPR(1), createMockPR(3)]);

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap().map((pr) => pr.id.number)).toEqual([3, 2, 1]);
	});

	it("deletes matching prs", () => {
		const service = new ChangeRequestCacheService({
			storage: new InMemoryStorage(),
		});

		service.setPRs([createMockPR(1), createMockPR(2), createMockPR(3)]);
		const result = service.deletePRs([createMockPR(2)]);

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap().map((pr) => pr.id.number)).toEqual([1, 3]);
	});
});
