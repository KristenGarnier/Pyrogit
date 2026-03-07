import { create } from "zustand";
import type { YDirectionsActions } from "../utils/key-mapper";

type Direction = YDirectionsActions;

export type ListFocusState<T> = {
  current: { index: number; data: T } | undefined;

  next: (direction: Direction, items: T[]) => void;
  reset: () => void;
};

function nextItem<T>(
  items: T[],
  current: ListFocusState<T>["current"],
  direction: Direction,
): ListFocusState<T>["current"] {
  if (items.length === 0) return undefined;
  if (!current) return { index: 0, data: items[0] as T };

  const index = current.index;

  switch (direction) {
    case "up": {
      if (!items[index - 1]) {
        const lastIndex = items.length - 1;
        return { index: lastIndex, data: items[lastIndex] as T };
      }
      return { index: index - 1, data: items[index - 1] as T };
    }
    case "down": {
      if (!items[index + 1]) {
        return { index: 0, data: items[0] as T };
      }
      return { index: index + 1, data: items[index + 1] as T };
    }
    default:
      return current;
  }
}

function initialValueFactory<T>(initialValue?: T): ListFocusState<T>["current"] {
  if (!initialValue) return undefined;

  return {
    index: 0,
    data: initialValue,
  };
}

export function createListFocusStore<T>(initialValue?: T) {
  return create<ListFocusState<T>>((set) => ({
    current: initialValueFactory(initialValue),

    next: (direction, items) =>
      set((state) => {
        const next = nextItem(items, state.current, direction);
        return { current: next };
      }),

    reset: () => set({ current: initialValueFactory(initialValue) }),
  }));
}
