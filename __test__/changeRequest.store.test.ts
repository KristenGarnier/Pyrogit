import { describe, expect, it, beforeEach } from "bun:test";
import { useChangeRequestStore } from "../infrastructure/react/src/stores/changeRequest.store";

describe("useChangeRequestStore", () => {
	const mockPR1 = {
		id: 1,
		title: "PR 1",
		author: { login: "user1" },
		createdAt: "2023-01-01",
		updatedAt: "2023-01-02",
	} as any;

	const mockPR2 = {
		id: 2,
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

	it("should handle complex upsert scenarios", () => {
		// Add initial PRs
		useChangeRequestStore.getState().setPRs([mockPR1, mockPR2]);

		// Update first PR
		useChangeRequestStore.getState().upsertPR(mockPR1Updated);

		// Add a new PR
		const mockPR3 = { ...mockPR2, id: 3, title: "PR 3" };
		useChangeRequestStore.getState().upsertPR(mockPR3);

		const state = useChangeRequestStore.getState();
		expect(state.prs).toEqual([mockPR1Updated, mockPR2, mockPR3]);
	});
});
