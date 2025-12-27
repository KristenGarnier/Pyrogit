import * as path from "node:path";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FileStorage } from "../../../services/storage/file.storage";
import { AppDirectories } from "../../../services/storage/locator.storage";
import {
	ayuDarkTheme,
	ayuLightTheme,
	ayuMirageTheme,
	catppuccinFrappeTheme,
	catppuccinLatteTheme,
	catppuccinMacchiatoTheme,
	catppuccinMochaTheme,
	cobalt2Theme,
	draculaTheme,
	githubDarkDimmedTheme,
	githubDarkTheme,
	githubLightTheme,
	gruvboxDarkTheme,
	gruvboxLightTheme,
	materialPalenightTheme,
	materialTheme,
	monokaiProTheme,
	monokaiTheme,
	nightOwlTheme,
	nordTheme,
	oneDarkProTheme,
	oneDarkTheme,
	shadesOfPurpleTheme,
	solarizedDarkTheme,
	solarizedLightTheme,
	tokyoNightTheme,
	vitesseTheme,
} from "../themes";
import { zustandFileStorage } from "../utils/zustand-file-storage.utils";

const directory = new AppDirectories("pyrogit");
const storage = new FileStorage(
	path.join(directory.getPath("config"), "theme.json"),
);

export type Theme =
	| typeof catppuccinMochaTheme
	| typeof tokyoNightTheme
	| typeof draculaTheme
	| typeof oneDarkTheme
	| typeof oneDarkProTheme
	| typeof monokaiTheme
	| typeof monokaiProTheme
	| typeof gruvboxDarkTheme
	| typeof gruvboxLightTheme
	| typeof nordTheme
	| typeof nightOwlTheme
	| typeof materialTheme
	| typeof materialPalenightTheme
	| typeof githubDarkTheme
	| typeof githubDarkDimmedTheme
	| typeof githubLightTheme
	| typeof solarizedDarkTheme
	| typeof solarizedLightTheme
	| typeof ayuDarkTheme
	| typeof ayuLightTheme
	| typeof ayuMirageTheme
	| typeof cobalt2Theme
	| typeof shadesOfPurpleTheme
	| typeof vitesseTheme
	| typeof catppuccinLatteTheme
	| typeof catppuccinFrappeTheme
	| typeof catppuccinMacchiatoTheme;

export const themeMap = {
	"catppuccin-mocha": catppuccinMochaTheme,
	"catppuccin-latte": catppuccinLatteTheme,
	"catppuccin-frappe": catppuccinFrappeTheme,
	"catppuccin-macchiato": catppuccinMacchiatoTheme,
	"tokyo-night": tokyoNightTheme,
	dracula: draculaTheme,
	"one-dark": oneDarkTheme,
	"one-dark-pro": oneDarkProTheme,
	monokai: monokaiTheme,
	"monokai-pro": monokaiProTheme,
	"gruvbox-dark": gruvboxDarkTheme,
	"gruvbox-light": gruvboxLightTheme,
	nord: nordTheme,
	"night-owl": nightOwlTheme,
	"material-dark": materialTheme,
	"material-light": materialPalenightTheme,
	"github-dark": githubDarkTheme,
	"github-dark-dimmed": githubDarkDimmedTheme,
	"github-light": githubLightTheme,
	"solarized-dark": solarizedDarkTheme,
	"solarized-light": solarizedLightTheme,
	"ayu-dark": ayuDarkTheme,
	"ayu-light": ayuLightTheme,
	"ayu-mirage": ayuMirageTheme,
	cobalt2: cobalt2Theme,
	"shades-of-purple": shadesOfPurpleTheme,
	vitesse: vitesseTheme,
};

export type KeyThemeMap = keyof typeof themeMap;

type ThemeStore = {
	currentTheme: Theme;
	themeName: string;

	setTheme: (theme: Theme, name: string) => void;
	getCurrentTheme: () => Theme;
	getThemeName: () => string;

	switchToTheme: (themeName: keyof typeof themeMap) => void;
	getAvailableThemes: () => string[];
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set, get) => ({
			currentTheme: catppuccinMochaTheme,
			themeName: "catppuccin-mocha",

			setTheme: (theme: Theme, name: string) =>
				set({
					currentTheme: theme,
					themeName: name,
				}),

			getCurrentTheme: () => get().currentTheme,
			getThemeName: () => get().themeName,

			switchToTheme: (themeName: keyof typeof themeMap) => {
				const theme = themeMap[themeName];
				if (theme) {
					set({
						currentTheme: theme,
						themeName,
					});
				}
			},

			getAvailableThemes: () => Object.keys(themeMap),
		}),
		{
			name: "theme-storage",
			storage: createJSONStorage(zustandFileStorage(storage)),
			onRehydrateStorage: () => (state) => {
				if (state && !state.currentTheme) {
					const theme = themeMap[state.themeName as keyof typeof themeMap];
					if (theme) {
						state.currentTheme = theme;
					} else {
						state.currentTheme = catppuccinMochaTheme;
						state.themeName = "catppuccin-mocha";
					}
				}
			},
		},
	),
);
