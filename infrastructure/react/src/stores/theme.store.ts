import { create } from "zustand";
import { themePreferenceService } from "../services/theme-preference.service";
export type { KeyThemeMap, Theme } from "../services/theme-catalog.service";
import type { Theme } from "../services/theme-catalog.service";

type ThemeStore = {
	currentTheme: Theme;
	themeName: string;

	hydrate: () => Promise<void>;
	selectTheme: (themeName: string) => Promise<void>;
	getCurrentTheme: () => Theme;
	getThemeName: () => string;
	getAvailableThemes: () => string[];
};

const initialSelection = themePreferenceService.get()._unsafeUnwrap();

function applySelection(
	set: (partial: Partial<ThemeStore>) => void,
	selection: { name: string; theme: Theme },
) {
	set({
		currentTheme: selection.theme,
		themeName: selection.name,
	});
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
	currentTheme: initialSelection.theme,
	themeName: initialSelection.name,

	hydrate: async () => {
		const result = await themePreferenceService.hydrate();
		if (result.isErr()) return;

		applySelection(set, result.value);
	},

	selectTheme: async (themeName: string) => {
		const result = await themePreferenceService.setThemeName(themeName);
		if (result.isErr()) return;

		applySelection(set, result.value);
	},

	getCurrentTheme: () => get().currentTheme,
	getThemeName: () => get().themeName,

	getAvailableThemes: () => {
		const result = themePreferenceService.getAvailableThemes();
		if (result.isErr()) return [];

		return result.value;
	},
}));
