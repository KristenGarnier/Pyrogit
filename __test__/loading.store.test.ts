import { describe, expect, it, beforeEach } from "bun:test";
import { useLoadingStore } from "../infrastructure/react/src/stores/loading";

describe("useLoadingStore", () => {
	beforeEach(() => {
		// Reset store state before each test
		useLoadingStore.setState({
			isLoading: false,
			message: undefined,
		});
	});

	it("should have initial state with isLoading false", () => {
		const state = useLoadingStore.getState();

		expect(state.isLoading).toBe(false);
		expect(state.message).toBeUndefined();
	});

	it("should start loading with message", () => {
		useLoadingStore.getState().start("Loading data...");

		const state = useLoadingStore.getState();
		expect(state.isLoading).toBe(true);
		expect(state.message).toBe("Loading data...");
	});

	it("should start loading without message", () => {
		useLoadingStore.getState().start();

		const state = useLoadingStore.getState();
		expect(state.isLoading).toBe(true);
		expect(state.message).toBeUndefined();
	});

	it("should stop loading and clear message", () => {
		useLoadingStore.getState().start("Loading...");
		expect(useLoadingStore.getState().isLoading).toBe(true);
		expect(useLoadingStore.getState().message).toBe("Loading...");

		useLoadingStore.getState().stop();

		const state = useLoadingStore.getState();
		expect(state.isLoading).toBe(false);
		expect(state.message).toBeUndefined();
	});

	it("should handle multiple start/stop cycles", () => {
		useLoadingStore.getState().start("First load");
		expect(useLoadingStore.getState().isLoading).toBe(true);
		expect(useLoadingStore.getState().message).toBe("First load");

		useLoadingStore.getState().start("Second load");
		expect(useLoadingStore.getState().isLoading).toBe(true);
		expect(useLoadingStore.getState().message).toBe("Second load");

		useLoadingStore.getState().stop();

		const state = useLoadingStore.getState();
		expect(state.isLoading).toBe(false);
		expect(state.message).toBeUndefined();
	});
});
