import { describe, expect, it, beforeEach } from "bun:test";
import { useChangeRequestStore } from "../infrastructure/react/src/stores/changeRequest.store";

describe("useChangeRequestStore", () => {
	const mockPR1 = {
		id: { number: 1 },
		title: "PR 1",
		author: { login: "user1" },
		createdAt: "2023-01-01",
		updatedAt: "2023-01-02",
	} as any;

	const mockPR2 = {
		id: { number: 2 },
		title: "PR 2",
		author: { login: "user2" },
		createdAt: "2023-01-01",
		updatedAt: "2023-01-02",
	} as any;

	const mockPR1Updated = {
		...mockPR1,
		title: "PR 1 Updated",
	} as any;

	beforeEach(() => {
		// Reset store state before each test
		useChangeRequestStore.setState({
			prs: [],
			loading: false,
			error: null,
			filter: "",
		});
	});

	it("should have initial state", () => {
		const state = useChangeRequestStore.getState();

		expect(state.prs).toEqual([]);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
		expect(state.filter).toBe("");
	});

	it("should set PRs", () => {
		useChangeRequestStore.getState().setPRs([mockPR1, mockPR2]);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toEqual([mockPR1, mockPR2]);
	});

	it("should upsert new PR", () => {
		useChangeRequestStore.getState().upsertPR(mockPR1);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toEqual([mockPR1]);
	});

	it("should upsert existing PR", () => {
		useChangeRequestStore.getState().setPRs([mockPR1]);
		useChangeRequestStore.getState().upsertPR(mockPR1Updated);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toEqual([mockPR1Updated]);
	});

	it("should add new PR when upserting non-existing", () => {
		useChangeRequestStore.getState().setPRs([mockPR1]);
		useChangeRequestStore.getState().upsertPR(mockPR2);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toEqual([mockPR1, mockPR2]);
	});

	it("should clear PRs", () => {
		useChangeRequestStore.getState().setPRs([mockPR1, mockPR2]);
		expect(useChangeRequestStore.getState().prs).toHaveLength(2);

		useChangeRequestStore.getState().clearPRs();

		const state = useChangeRequestStore.getState();
		expect(state.prs).toEqual([]);
	});

	it("should set loading state", () => {
		useChangeRequestStore.getState().setLoading(true);

		expect(useChangeRequestStore.getState().loading).toBe(true);

		useChangeRequestStore.getState().setLoading(false);

		expect(useChangeRequestStore.getState().loading).toBe(false);
	});

	it("should set error state", () => {
		const errorMessage = "Network error";

		useChangeRequestStore.getState().setError(errorMessage);

		expect(useChangeRequestStore.getState().error).toBe(errorMessage);

		useChangeRequestStore.getState().setError(null);

		expect(useChangeRequestStore.getState().error).toBeNull();
	});

	it("should set filter", () => {
		const filter = "test filter";

		useChangeRequestStore.getState().setFilter(filter);

		expect(useChangeRequestStore.getState().filter).toBe(filter);
	});

	it("should upsert multiple PRs", () => {
		const newPR = { ...mockPR2, id: { number: 3 }, title: "PR 3" };
		const updatedPR1 = { ...mockPR1, title: "Updated PR 1" };

		useChangeRequestStore.getState().upsertPRs([mockPR1, newPR]);

		let state = useChangeRequestStore.getState();
		expect(state.prs).toHaveLength(2);
		expect(state.prs[0].id.number).toBe(3); // sorted descending
		expect(state.prs[1].id.number).toBe(1);

		// Upsert with update and new
		useChangeRequestStore.getState().upsertPRs([updatedPR1, mockPR2]);

		state = useChangeRequestStore.getState();
		expect(state.prs).toHaveLength(3);
		expect(state.prs[0].id.number).toBe(3); // highest number first
		expect(state.prs[1].id.number).toBe(2);
		expect(state.prs[2].id.number).toBe(1);
		expect(state.prs[2].title).toBe("Updated PR 1"); // updated
	});

	it("should delete PRs", () => {
		useChangeRequestStore.getState().setPRs([mockPR1, mockPR2]);

		expect(useChangeRequestStore.getState().prs).toHaveLength(2);

		useChangeRequestStore.getState().deletePRs([mockPR1]);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toHaveLength(1);
		expect(state.prs[0]).toEqual(mockPR2);
	});

	it("should delete multiple PRs", () => {
		const mockPR3 = { ...mockPR2, id: { number: 3 } };
		useChangeRequestStore.getState().setPRs([mockPR1, mockPR2, mockPR3]);

		useChangeRequestStore.getState().deletePRs([mockPR1, mockPR3]);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toHaveLength(1);
		expect(state.prs[0]).toEqual(mockPR2);
	});

	it("should handle complex upsert scenarios", () => {
		// Add initial PRs
		useChangeRequestStore.getState().setPRs([mockPR1, mockPR2]);

		// Update first PR
		useChangeRequestStore.getState().upsertPR(mockPR1Updated);

		// Add a new PR
		const mockPR3 = { ...mockPR2, id: { number: 3 }, title: "PR 3" };
		useChangeRequestStore.getState().upsertPR(mockPR3);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toEqual([mockPR1Updated, mockPR2, mockPR3]);
	});

	describe("Resilience Tests", () => {
		it("should handle upsertPRs with empty array", () => {
			useChangeRequestStore.getState().setPRs([mockPR1]);
			useChangeRequestStore.getState().upsertPRs([]);

			const state = useChangeRequestStore.getState();
			expect(state.prs).toEqual([mockPR1]);
		});

		it("should handle upsertPRs with duplicate PRs", () => {
			useChangeRequestStore.getState().upsertPRs([mockPR1, mockPR1]);

			const state = useChangeRequestStore.getState();
			expect(state.prs).toHaveLength(1); // Duplicates are not allowed
			expect(state.prs[0]).toEqual(mockPR1);
		});

		it("should handle deletePRs with empty array", () => {
			useChangeRequestStore.getState().setPRs([mockPR1]);
			useChangeRequestStore.getState().deletePRs([]);

			const state = useChangeRequestStore.getState();
			expect(state.prs).toEqual([mockPR1]);
		});

		it("should handle deletePRs with non-existing PRs", () => {
			useChangeRequestStore.getState().setPRs([mockPR1]);
			const nonExisting = { ...mockPR2, id: { number: 999 } };
			useChangeRequestStore.getState().deletePRs([nonExisting]);

			const state = useChangeRequestStore.getState();
			expect(state.prs).toEqual([mockPR1]);
		});

		it("should handle setError with various inputs", () => {
			useChangeRequestStore.getState().setError("error message");
			expect(useChangeRequestStore.getState().error).toBe("error message");

			useChangeRequestStore.getState().setError("");
			expect(useChangeRequestStore.getState().error).toBe("");

			useChangeRequestStore.getState().setError(null);
			expect(useChangeRequestStore.getState().error).toBeNull();
		});

		it("should handle setFilter with edge cases", () => {
			useChangeRequestStore.getState().setFilter("");
			expect(useChangeRequestStore.getState().filter).toBe("");

			useChangeRequestStore.getState().setFilter("   ");
			expect(useChangeRequestStore.getState().filter).toBe("   ");
		});

		it("should maintain state integrity with invalid operations", () => {
			// Test with undefined/null where possible (though TS prevents some)
			useChangeRequestStore.getState().setPRs([]);
			expect(useChangeRequestStore.getState().prs).toEqual([]);

			// Attempt to upsert invalid PR (simulate)
			const invalidPR = { id: null, title: "invalid" } as any;
			expect(() => useChangeRequestStore.getState().upsertPR(invalidPR)).not.toThrow();
		});
	});
});
