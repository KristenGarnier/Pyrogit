import { useRef } from "react";
import { createListFocusStore } from "../stores/item.focus.generic.store";

export function useScopedStore<T>(first?: T) {
  const storeRef = useRef<ReturnType<typeof createListFocusStore<T>>>(null);
  if (!storeRef.current) {
    storeRef.current = createListFocusStore<T>(first);
  }
  return storeRef.current();
}
