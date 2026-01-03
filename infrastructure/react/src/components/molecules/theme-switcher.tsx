import { useKeyboard } from "@opentui/react";
import { useTabFocus } from "../../stores/tab.focus.store";
import { useThemeStore } from "../../stores/theme.store";

export function ThemeSwitcher() {
	const { currentTheme, themeName } = useThemeStore();
	const tabFocusStore = useTabFocus();

	useKeyboard((key) => {
		if (tabFocusStore.disabled) return;

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
