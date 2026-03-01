import { create } from "zustand";

type LoadingState = {
  isLoading: boolean;
  message?: string;

  start: (message?: string) => void;
  stop: () => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: undefined,

  start: (message) =>
    set({
      isLoading: true,
      message,
    }),

  stop: () =>
    set({
      isLoading: false,
      message: undefined,
    }),
}));
