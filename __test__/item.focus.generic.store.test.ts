import { describe, expect, it, beforeEach } from "bun:test";
import { createListFocusStore } from "../infrastructure/react/src/stores/item.focus.generic.store";

describe("createListFocusStore", () => {
	const mockItems = [
		{ id: 1, name: "Item 1" },
		{ id: 2, name: "Item 2" },
		{ id: 3, name: "Item 3" },
	];

	it("should create store with undefined current when no initial value", () => {
		const store = createListFocusStore();

		expect(store.getState().current).toBeUndefined();
	});

	it("should create store with initial value", () => {
		const initialItem = { id: 1, name: "Initial" };
		const store = createListFocusStore(initialItem);

		const state = store.getState();
		expect(state.current).toEqual({
			index: 0,
			data: initialItem,
		});
	});

	describe("next navigation", () => {
		let store: ReturnType<typeof createListFocusStore>;

		beforeEach(() => {
			store = createListFocusStore();
		});

		it("should start at first item when no current", () => {
			store.getState().next("down", mockItems);

			const state = store.getState();
			expect(state.current).toEqual({
				index: 0,
				data: mockItems[0],
			});
		});

		it("should move down through items", () => {
			store.getState().next("down", mockItems); // index 0
			expect(store.getState().current?.index).toBe(0);

			store.getState().next("down", mockItems); // index 1
			expect(store.getState().current?.index).toBe(1);

			store.getState().next("down", mockItems); // index 2
			expect(store.getState().current?.index).toBe(2);

			store.getState().next("down", mockItems); // wrap to index 0
			expect(store.getState().current?.index).toBe(0);
		});

		it("should move up through items", () => {
			store.getState().next("down", mockItems); // start at index 0
			store.getState().next("down", mockItems); // index 1
			expect(store.getState().current?.index).toBe(1);

			store.getState().next("up", mockItems); // back to index 0
			expect(store.getState().current?.index).toBe(0);

			store.getState().next("up", mockItems); // wrap to last index (2)
			expect(store.getState().current?.index).toBe(2);
		});

		it("should handle empty items array", () => {
			store.getState().next("down", []);

			expect(store.getState().current).toBeUndefined();
		});

		it("should not change on unknown direction", () => {
			store.getState().next("down", mockItems);
			const stateBefore = store.getState();

			store.getState().next("unknown" as any, mockItems);

			const stateAfter = store.getState();
			expect(stateAfter.current).toEqual(stateBefore.current);
		});
	});

	describe("reset", () => {
		it("should reset to undefined when no initial value", () => {
			const store = createListFocusStore();

			store.getState().next("down", mockItems);
			expect(store.getState().current).toBeDefined();

			store.getState().reset();
			expect(store.getState().current).toBeUndefined();
		});

		it("should reset to initial value", () => {
			const initialItem = { id: 1, name: "Initial" };
			const store = createListFocusStore(initialItem);

			store.getState().next("down", mockItems);
			expect(store.getState().current?.data).not.toBe(initialItem);

			store.getState().reset();
			expect(store.getState().current).toEqual({
				index: 0,
				data: initialItem,
			});
		});
	});
});
