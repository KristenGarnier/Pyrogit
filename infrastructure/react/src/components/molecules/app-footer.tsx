import { useThemeStore } from "../../stores/theme.store";
import { ThemeSwitcher } from "./theme-switcher";

export function AppFooter() {
	const { currentTheme } = useThemeStore();

	return (
		<box flexDirection="row" gap={1} marginLeft={1}>
			<text fg={currentTheme.muted}>
				<strong>PyroGit</strong>
			</text>
			<text fg={currentTheme.muted}>
				<em>v0.0.1</em>
			</text>
			<ThemeSwitcher />
		</box>
	);
}
