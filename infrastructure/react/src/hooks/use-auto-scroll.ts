import type { ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { useEffect } from "react";

interface UseAutoScrollOptions {
  itemHeight?: number;
  overhead?: number;
}

export function calculateScrollPosition(
  height: number,
  currentIndex: number,
  totalItems: number,
  options: UseAutoScrollOptions = {},
): number {
  const { itemHeight = 1, overhead = 4 } = options;

  const visibleRows = Math.floor((height - overhead) / itemHeight);
  const lowBound = Math.floor(visibleRows / 2);
  const highBound = totalItems - lowBound;
  const scrollPos = currentIndex;

  if (scrollPos < lowBound) {
    return 0;
  }

  if (scrollPos > highBound) {
    return totalItems;
  }

  if (lowBound < scrollPos) {
    return scrollPos - lowBound;
  }

  return 0;
}

export function useAutoScroll(
  scrollRef: RefObject<ScrollBoxRenderable | null>,
  height: number,
  currentIndex: number | undefined,
  totalItems: number,
  options: UseAutoScrollOptions = {},
) {
  useEffect(() => {
    if (!scrollRef.current || currentIndex === undefined || currentIndex < 0) return;

    const scrollPosition = calculateScrollPosition(height, currentIndex, totalItems, options);
    scrollRef.current.scrollTo(scrollPosition);
  }, [currentIndex, height, totalItems, scrollRef, options]);
}
