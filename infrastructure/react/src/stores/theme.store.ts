import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { catppuccinMochaTheme } from "../themes/captuccin-mocha";
import { FileStorage } from "../../../services/storage/file.storage";
import * as path from "node:path";
import { AppDirectories } from "../../../services/storage/locator.storage";
import { zustandFileStorage } from "../utils/zustand-file-storage.utils";

const directory = new AppDirectories("pyrogit");
const storage = new FileStorage(
	path.join(directory.getPath("config"), "theme.json"),
);

export type Theme = typeof catppuccinMochaTheme;

type ThemeStore = {
	// State
	currentTheme: Theme;
	themeName: string;

	// Actions
	setTheme: (theme: Theme, name: string) => void;
	getCurrentTheme: () => Theme;
	getThemeName: () => string;
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set, get) => ({
			// State
			currentTheme: catppuccinMochaTheme,
			themeName: "catppuccin-mocha",

			// Actions
			setTheme: (theme: Theme, name: string) =>
				set({
					currentTheme: theme,
					themeName: name,
				}),

			getCurrentTheme: () => get().currentTheme,
			getThemeName: () => get().themeName,
		}),
		{
			name: "theme-storage",
			storage: createJSONStorage(zustandFileStorage(storage)),
			partialize: (state) => ({
				themeName: state.themeName,
			}),
			onRehydrateStorage: () => (state) => {
				// Will be implemented when we add multiple themes
				// For now, always use catppuccin-mocha
				if (state && !state.currentTheme) {
					state.currentTheme = catppuccinMochaTheme;
				}
			},
		},
	),
);
