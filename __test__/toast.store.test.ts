import { describe, expect, it, beforeEach } from "bun:test";
import {
	useToastStore,
	useToastActions,
} from "../infrastructure/react/src/stores/toast.store";

describe("useToastStore", () => {
	beforeEach(() => {
		// Reset store state before each test
		useToastStore.setState({ toasts: [] });
	});

	it("should have initial state with empty toasts array", () => {
		const state = useToastStore.getState();

		expect(state.toasts).toEqual([]);
	});

	it("should add toast with default info type", () => {
		useToastStore.getState().addToast("Test message");

		const state = useToastStore.getState();
		expect(state.toasts).toHaveLength(1);
		const toast = state.toasts[0];
		expect(toast).toMatchObject({
			message: "Test message",
			type: "info",
			duration: 3000,
		});
		expect(toast.id).toBeDefined();
		expect(toast.timestamp).toBeDefined();
		expect(typeof toast.id).toBe("string");
		expect(typeof toast.timestamp).toBe("number");
	});

	it("should add toast with custom type and duration", () => {
		useToastStore.getState().addToast("Success message", "success", 5000);

		const state = useToastStore.getState();
		expect(state.toasts).toHaveLength(1);
		expect(state.toasts[0]).toMatchObject({
			message: "Success message",
			type: "success",
			duration: 5000,
		});
	});

	it("should remove toast by id", () => {
		useToastStore.getState().addToast("First toast");
		useToastStore.getState().addToast("Second toast");

		const state = useToastStore.getState();
		expect(state.toasts).toHaveLength(2);

		const firstToastId = state.toasts[0].id;
		useToastStore.getState().removeToast(firstToastId);

		const updatedState = useToastStore.getState();
		expect(updatedState.toasts).toHaveLength(1);
		expect(updatedState.toasts[0].message).toBe("Second toast");
	});

	it("should clear all toasts", () => {
		useToastStore.getState().addToast("Toast 1");
		useToastStore.getState().addToast("Toast 2");
		useToastStore.getState().addToast("Toast 3");

		expect(useToastStore.getState().toasts).toHaveLength(3);

		useToastStore.getState().clearAll();

		expect(useToastStore.getState().toasts).toEqual([]);
	});

	it("should generate unique ids for toasts", () => {
		useToastStore.getState().addToast("Toast 1");
		useToastStore.getState().addToast("Toast 2");

		const state = useToastStore.getState();
		const id1 = state.toasts[0].id;
		const id2 = state.toasts[1].id;

		expect(id1).not.toBe(id2);
		expect(typeof id1).toBe("string");
		expect(typeof id2).toBe("string");
	});
});

describe("useToastActions", () => {
	beforeEach(() => {
		// Reset store state before each test
		useToastStore.setState({ toasts: [] });
	});

	it("should provide action functions", () => {
		const actions = useToastActions();

		expect(typeof actions.info).toBe("function");
		expect(typeof actions.success).toBe("function");
		expect(typeof actions.warning).toBe("function");
		expect(typeof actions.error).toBe("function");
		expect(typeof actions.clear).toBe("function");
	});

	it("should add toast with correct type using actions", () => {
		const actions = useToastActions();

		actions.success("Success!");

		const state = useToastStore.getState();
		expect(state.toasts).toHaveLength(1);
		expect(state.toasts[0]).toMatchObject({
			message: "Success!",
			type: "success",
		});
	});
});
