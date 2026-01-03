import { describe, expect, it } from "bun:test";
import { renderHook } from "@testing-library/react";
import {
	calculateScrollPosition,
	useAutoScroll,
} from "../infrastructure/react/src/hooks/use-auto-scroll";

describe("calculateScrollPosition", () => {
	it("should return 0 if index is below low bound", () => {
		expect(calculateScrollPosition(20, 0, 10)).toBe(0);
		expect(calculateScrollPosition(20, 7, 10)).toBe(0); // lowBound = 8
		expect(calculateScrollPosition(20, 3, 10)).toBe(0); // 3 < 8
		expect(calculateScrollPosition(20, 5, 10)).toBe(0); // 5 < 8
	});

	it("should return totalItems if index is above high bound", () => {
		expect(calculateScrollPosition(20, 9, 10)).toBe(10); // highBound = 2, 9 > 2
		expect(calculateScrollPosition(20, 8, 10)).toBe(10); // 8 > 2
	});

	it("should handle custom options with different itemHeight and overhead", () => {
		expect(
			calculateScrollPosition(20, 2, 10, { itemHeight: 2, overhead: 2 }),
		).toBe(0); // lowBound=4, 2<4, 0
		expect(
			calculateScrollPosition(20, 5, 10, { itemHeight: 2, overhead: 2 }),
		).toBe(1); // 4<5, 5-4=1
		expect(
			calculateScrollPosition(20, 7, 10, { itemHeight: 2, overhead: 2 }),
		).toBe(10); // 7>6, 10
	});
});

describe("useAutoScroll", () => {
	it("should call scrollTo with correct position when currentIndex is valid", () => {
		let scrollPosition = -1;
		const scrollTo = (pos: number) => {
			scrollPosition = pos;
		};
		const mockScrollRef = { current: { scrollTo } };

		renderHook(() => useAutoScroll(mockScrollRef as any, 20, 5, 10));

		expect(scrollPosition).toBe(0); // calculateScrollPosition(20, 5, 10) = 0 (5 < lowBound of 8)
	});

	it("should call scrollTo with correct position using custom options", () => {
		let scrollPosition = -1;
		const scrollTo = (pos: number) => {
			scrollPosition = pos;
		};
		const mockScrollRef = { current: { scrollTo } };

		renderHook(() =>
			useAutoScroll(mockScrollRef as any, 20, 5, 10, {
				itemHeight: 2,
				overhead: 2,
			}),
		);

		expect(scrollPosition).toBe(1); // calculateScrollPosition(20, 5, 10, {itemHeight: 2, overhead: 2}) = 1
	});

	it("should not call scrollTo when currentIndex is undefined", () => {
		let called = false;
		const scrollTo = () => {
			called = true;
		};
		const mockScrollRef = { current: { scrollTo } };

		renderHook(() => useAutoScroll(mockScrollRef as any, 20, undefined, 10));

		expect(called).toBe(false);
	});

	it("should not call scrollTo when currentIndex is negative", () => {
		let called = false;
		const scrollTo = () => {
			called = true;
		};
		const mockScrollRef = { current: { scrollTo } };

		renderHook(() => useAutoScroll(mockScrollRef as any, 20, -1, 10));

		expect(called).toBe(false);
	});

	it("should not call scrollTo when scrollRef.current is null", () => {
		let called = false;
		const _scrollTo = () => {
			called = true;
		};
		const mockScrollRef = { current: null };

		renderHook(() => useAutoScroll(mockScrollRef as any, 20, 5, 10));

		expect(called).toBe(false);
	});

	it("should update scroll position when currentIndex changes", () => {
		let scrollPosition = -1;
		const scrollTo = (pos: number) => {
			scrollPosition = pos;
		};
		const mockScrollRef = { current: { scrollTo } };

		const { rerender } = renderHook(
			({ currentIndex }) =>
				useAutoScroll(mockScrollRef as any, 20, currentIndex, 10),
			{ initialProps: { currentIndex: 5 } },
		);

		expect(scrollPosition).toBe(0);

		scrollPosition = -1; // Reset
		rerender({ currentIndex: 8 });

		expect(scrollPosition).toBe(10); // calculateScrollPosition(20, 8, 10) = 10
	});
});
