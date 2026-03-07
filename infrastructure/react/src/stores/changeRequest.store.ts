import { create } from "zustand";
import type { ChangeRequest } from "../../../../domain/change-request";
import { changeRequestCacheService } from "../services/change-request-cache.service";

interface ChangeRequestStore {
  prs: ChangeRequest[];

  loading: boolean;
  error: string | null;
  filter: string;

  hydrate: () => Promise<void>;
  setPRs(prs: ChangeRequest[]): void;
  upsertPR(pr: ChangeRequest): void;
  upsertPRs(prs: ChangeRequest[]): void;
  deletePRs(prs: ChangeRequest[]): void;
  clearPRs(): void;

  setLoading(loading: boolean): void;
  setError(error: string | null): void;

  setFilter(filter: string): void;
}

function applyResult(
  set: (partial: Partial<ChangeRequestStore>) => void,
  result: ReturnType<typeof changeRequestCacheService.get>,
) {
  if (result.isErr()) {
    set({ error: result.error.message });
    return;
  }

  set({ prs: result.value, error: null });
}

const initialPRsResult = changeRequestCacheService.get();

export const useChangeRequestStore = create<ChangeRequestStore>((set) => ({
  prs: initialPRsResult.isOk() ? initialPRsResult.value : [],
  loading: false,
  error: null,
  filter: "",

  hydrate: async () => {
    const result = await changeRequestCacheService.hydrate();
    if (result.isErr()) {
      set({ error: result.error.message });
      return;
    }

    set({ prs: result.value, error: null });
  },

  setPRs: (prs) => {
    applyResult(set, changeRequestCacheService.setPRs(prs));
  },

  upsertPR: (pr) => {
    applyResult(set, changeRequestCacheService.upsertPR(pr));
  },

  upsertPRs: (prs) => {
    applyResult(set, changeRequestCacheService.upsertPRs(prs));
  },

  deletePRs: (prs) => {
    applyResult(set, changeRequestCacheService.deletePRs(prs));
  },

  clearPRs: () => {
    applyResult(set, changeRequestCacheService.clearPRs());
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setFilter: (filter) => set({ filter }),
}));
