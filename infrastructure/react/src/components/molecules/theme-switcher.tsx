import { useKeyboard } from "@opentui/react";
import { useThemeStore } from "../../stores/theme.store";
import { useTabFocus } from "../../stores/tab.focus.store";

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
	const { currentTheme, themeName } = useThemeStore();
	const tabFocusStore = useTabFocus();

	useKeyboard((key) => {
		if (key.name === "t") {
			tabFocusStore.focusCustom("choose-theme");
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
