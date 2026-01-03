import { describe, expect, it, beforeEach } from "bun:test";
import { useChangeRequestFocusStore } from "../infrastructure/react/src/stores/change-request.focus.store";

describe("useChangeRequestFocusStore", () => {
	const mockPRs = [
		{ id: 1, title: "PR 1", author: { login: "user1" } },
		{ id: 2, title: "PR 2", author: { login: "user2" } },
		{ id: 3, title: "PR 3", author: { login: "user3" } },
	] as any;

	beforeEach(() => {
		// Reset store state before each test
		useChangeRequestFocusStore.setState({ current: undefined });
	});

	it("should start with undefined current", () => {
		const state = useChangeRequestFocusStore.getState();

		expect(state.current).toBeUndefined();
	});

	it("should navigate through PRs", () => {
		useChangeRequestFocusStore.getState().next("down", mockPRs);

		let state = useChangeRequestFocusStore.getState();
		expect(state.current).toEqual({
			index: 0,
			data: mockPRs[0],
		});

		useChangeRequestFocusStore.getState().next("down", mockPRs);
		state = useChangeRequestFocusStore.getState();
		expect(state.current).toEqual({
			index: 1,
			data: mockPRs[1],
		});

		useChangeRequestFocusStore.getState().next("up", mockPRs);
		state = useChangeRequestFocusStore.getState();
		expect(state.current).toEqual({
			index: 0,
			data: mockPRs[0],
		});
	});

	it("should reset focus", () => {
		useChangeRequestFocusStore.getState().next("down", mockPRs);
		expect(useChangeRequestFocusStore.getState().current).toBeDefined();

		useChangeRequestFocusStore.getState().reset();
		expect(useChangeRequestFocusStore.getState().current).toBeUndefined();
	});

	it("should handle empty PR list", () => {
		useChangeRequestFocusStore.getState().next("down", []);

		expect(useChangeRequestFocusStore.getState().current).toBeUndefined();
	});
});
