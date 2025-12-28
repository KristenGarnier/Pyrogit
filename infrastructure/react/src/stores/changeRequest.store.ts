import path from "node:path";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChangeRequest } from "../../../../domain/change-request";
import { FileStorage } from "../../../services/storage/file.storage";
import { AppDirectories } from "../../../services/storage/locator.storage";
import { zustandFileStorage } from "../utils/zustand-file-storage.utils";

const directory = new AppDirectories("pyrogit");
const storage = new FileStorage(
	path.join(directory.getPath("cache"), "prs.enc"),
);

interface ChangeRequestStore {
	prs: ChangeRequest[];

	loading: boolean;
	error: string | null;

	setPRs(prs: ChangeRequest[]): void;
	upsertPR(pr: ChangeRequest): void;
	clearPRs(): void;

	setLoading(loading: boolean): void;
	setError(error: string | null): void;

	getPRs(): ChangeRequest[];
}

export const useChangeRequestStore = create<ChangeRequestStore>()(
	persist(
		(set, get) => ({
			prs: [],
			loading: false,
			error: null,

			setPRs: (prs) => set({ prs }),

			upsertPR: (pr) =>
				set((state) => {
					const index = state.prs.findIndex((p) => p.id === pr.id);
					if (index === -1) {
						return { prs: [...state.prs, pr] };
					}
					const next = [...state.prs];
					next[index] = pr;
					return { prs: next };
				}),

			clearPRs: () => set({ prs: [] }),

			setLoading: (loading) => set({ loading }),

			setError: (error) => set({ error }),

			getPRs: () => {
				const { prs } = get();

				return prs.filter((_pr) => {
					return true;
				});
			},
		}),
		{
			name: "pr-persistor",
			storage: createJSONStorage(zustandFileStorage(storage)),
		},
	),
);
