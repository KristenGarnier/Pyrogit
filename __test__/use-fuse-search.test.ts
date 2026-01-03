import { describe, expect, it } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useFuseSearch } from "../infrastructure/react/src/hooks/use-fuse-search";

describe("useFuseSearch", () => {
	const mockItems = [
		{ id: 1, name: "Apple", category: "Fruit" },
		{ id: 2, name: "Banana", category: "Fruit" },
		{ id: 3, name: "Carrot", category: "Vegetable" },
		{ id: 4, name: "Orange", category: "Fruit" },
	];

	const fuseOptions = {
		keys: ["name", "category"],
		threshold: 0.4,
	};

	it("should return all items when query is empty and returnAllOnEmptyQuery is true", () => {
		const { result } = renderHook(() =>
			useFuseSearch(mockItems, { fuse: fuseOptions }),
		);

		const searchResult = result.current.search("");
		expect(searchResult).toEqual(mockItems);
	});

	it("should return empty array when query is empty and returnAllOnEmptyQuery is false", () => {
		const { result } = renderHook(() =>
			useFuseSearch(mockItems, {
				fuse: fuseOptions,
				returnAllOnEmptyQuery: false,
			}),
		);

		const searchResult = result.current.search("");
		expect(searchResult).toEqual([]);
	});

	it("should search items by name", () => {
		const { result } = renderHook(() =>
			useFuseSearch(mockItems, { fuse: fuseOptions }),
		);

		const searchResult = result.current.search("Apple");
		expect(searchResult).toContain(mockItems[0]);
		expect(searchResult).not.toContain(mockItems[1]);
	});

	it("should search items by category", () => {
		const { result } = renderHook(() =>
			useFuseSearch(mockItems, { fuse: fuseOptions }),
		);

		const searchResult = result.current.search("Fruit");
		expect(searchResult).toHaveLength(3);
		expect(searchResult).toContain(mockItems[0]);
		expect(searchResult).toContain(mockItems[1]);
		expect(searchResult).toContain(mockItems[3]);
	});

	it("should limit results when limit option is set", () => {
		const { result } = renderHook(() =>
			useFuseSearch(mockItems, { fuse: fuseOptions, limit: 1 }),
		);

		const searchResult = result.current.search("Fruit");
		expect(searchResult).toHaveLength(1);
	});

	it("should trim whitespace from query", () => {
		const { result } = renderHook(() =>
			useFuseSearch(mockItems, { fuse: fuseOptions }),
		);

		const searchResult = result.current.search("  Apple  ");
		expect(searchResult).toContain(mockItems[0]);
		expect(searchResult).toHaveLength(1);
	});

	it("should handle fuzzy search", () => {
		const { result } = renderHook(() =>
			useFuseSearch(mockItems, { fuse: fuseOptions }),
		);

		const searchResult = result.current.search("Appl"); // fuzzy match for Apple
		expect(searchResult).toContain(mockItems[0]);
	});
});
