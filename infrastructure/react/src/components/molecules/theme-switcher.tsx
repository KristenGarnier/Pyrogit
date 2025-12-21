import { useKeyboard } from "@opentui/react";
import { type themeMap, useThemeStore } from "../../stores/theme.store";
import { useToastActions } from "../../stores/toast.store";

const THEME_KEYS: Record<string, string> = {
	"1": "catppuccin-mocha",
	"2": "catppuccin-latte",
	"3": "catppuccin-frappe",
	"4": "catppuccin-macchiato",
	"5": "tokyo-night",
	"6": "dracula",
	"7": "one-dark",
	"8": "one-dark-pro",
	"9": "monokai",
	"0": "monokai-pro",
	q: "gruvbox-dark",
	w: "gruvbox-light",
	e: "nord",
	r: "night-owl",
	t: "material-dark",
	y: "material-light",
	u: "github-dark",
	i: "github-dark-dimmed",
	o: "github-light",
	p: "solarized-dark",
	a: "solarized-light",
	s: "ayu-dark",
	d: "ayu-light",
	f: "ayu-mirage",
	g: "cobalt2",
	l: "shades-of-purple",
	m: "vitesse",
};

export function ThemeSwitcher() {
	const { currentTheme, themeName, switchToTheme, getAvailableThemes } =
		useThemeStore();
	const toastStore = useToastActions();

	useKeyboard((key) => {
		if (key.name === "t") {
			const themes = getAvailableThemes();
			const themeList = themes.slice(0, 10).join(", ");
			const remaining =
				themes.length > 10 ? `... and ${themes.length - 10} more` : "";

			toastStore.info(`Current theme: ${themeName}`);
			toastStore.info(`Available themes: ${themeList}${remaining}`);
			toastStore.info("Press 1-0, q-j for themes");
		}

		const themeKey = THEME_KEYS[key.name];
		if (themeKey) {
			switchToTheme(themeKey as keyof typeof themeMap);
			toastStore.success(`Switched to ${themeKey}`);
		}
	});

	return (
		<box flexDirection="row" gap={1}>
			<text marginLeft={1} fg={currentTheme.primary}>
				
			</text>
			<text fg={currentTheme.muted}>{themeName}</text>
		</box>
	);
}
