import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChangeRequest } from "../../../../domain/change-request";
import { RootLocator } from "../../../services/locator/locators";
import { createSimpleStorage } from "../utils/init-file-storage.utils";
import { zustandFileStorage } from "../utils/zustand-file-storage.utils";

const projectPath = new RootLocator().findDir();
const projectPathName = projectPath
	? `${projectPath.split("/")[projectPath.split("/").length - 1]}-prs.enc`
	: "unknown-prs.enc";

interface ChangeRequestStore {
	prs: ChangeRequest[];

	loading: boolean;
	error: string | null;
	filter: string;

	setPRs(prs: ChangeRequest[]): void;
	upsertPR(pr: ChangeRequest): void;
	upsertPRs(prs: ChangeRequest[]): void;
	deletePRs(prs: ChangeRequest[]): void;
	clearPRs(): void;

	setLoading(loading: boolean): void;
	setError(error: string | null): void;

	setFilter(filter: string): void;
}

export const useChangeRequestStore = create<ChangeRequestStore>()(
	persist(
		(set, get) => ({
			prs: [],
			loading: false,
			error: null,
			filter: "",

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
			upsertPRs: (prs) =>
				set((state) => {
					const seen = new Set<number>();
					const uniquePRs = prs.filter((pr) => {
						const num = pr.id.number;
						if (seen.has(num)) return false;
						seen.add(num);
						return true;
					});
					const indexes = uniquePRs.map((pr) => pr.id.number);
					const stateFinal = state.prs
						.filter((pr) => !indexes.includes(pr.id.number))
						.concat(uniquePRs)
						.sort((a, b) => b.id.number - a.id.number);

					return { prs: stateFinal };
				}),

			deletePRs: (prs) =>
				set((state) => {
					const indexes = prs.map((pr) => pr.id.number);
					const onlyOpen = state.prs.filter(
						(pr) => !indexes.includes(pr.id.number),
					);

					return {
						prs: onlyOpen,
					};
				}),

			clearPRs: () => set({ prs: [] }),

			setLoading: (loading) => set({ loading }),

			setError: (error) => set({ error }),

			setFilter: (filter) => set({ filter }),
		}),
		{
			name: "pr-persistor",
			storage: createJSONStorage(
				zustandFileStorage(
					createSimpleStorage("pyrogit", "cache", projectPathName),
				),
			),
		},
	),
);
