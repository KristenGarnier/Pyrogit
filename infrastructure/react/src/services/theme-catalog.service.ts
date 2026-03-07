import type { ThemeCatalog, ThemeSnapshot } from "../../../../application/ports/theme-catalog";
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

export class ThemeCatalogService implements ThemeCatalog<Theme> {
	private readonly defaultThemeName: KeyThemeMap = "catppuccin-mocha";

	getDefault(): ThemeSnapshot<Theme> {
		return {
			name: this.defaultThemeName,
			theme: themeMap[this.defaultThemeName],
		};
	}

	resolveByName(name: string): ThemeSnapshot<Theme> {
		const key = name as KeyThemeMap;
		const theme = themeMap[key];
		if (!theme) return this.getDefault();

		return {
			name,
			theme,
		};
	}

	getAvailableNames(): string[] {
		return Object.keys(themeMap);
	}
}

export const themeCatalogService = new ThemeCatalogService();
