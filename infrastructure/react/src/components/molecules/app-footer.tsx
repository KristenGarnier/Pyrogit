import { useLoadingStore } from "../../stores/loading";
import { useThemeStore } from "../../stores/theme.store";
import { LoadingSpinner } from "../atoms/loading";
import { ThemeSwitcher } from "./theme-switcher";

export function AppFooter() {
	const { currentTheme } = useThemeStore();
	const loadingStore = useLoadingStore();

	return (
		<box
			marginLeft={1}
			marginRight={1}
			flexDirection="row"
			justifyContent="space-between"
		>
			<box flexDirection="row" gap={1}>
				<text fg={currentTheme.muted}>
					<strong>PyroGit</strong>
				</text>
				<text fg={currentTheme.muted}>
					<em>v0.5.0-alpha</em>
				</text>
				<ThemeSwitcher />

				<text marginLeft={1} fg={currentTheme.muted}>
					[?] Help
				</text>
			</box>
			<box flexDirection="row" gap={1}>
				{loadingStore.isLoading && <LoadingSpinner />}
			</box>
		</box>
	);
}
