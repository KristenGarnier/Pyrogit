import { useKeyboard } from "@opentui/react";
import { useCallback, useEffect, useState } from "react";
import { useScopedStore } from "../../hooks/use-scoped-store";
import { useTheme } from "../../hooks/use-theme";
import { useTabFocus } from "../../stores/tab.focus.store";
import { type KeyThemeMap, useThemeStore } from "../../stores/theme.store";
import {
	isAction,
	matchKey,
	type YDirectionsActions,
} from "../../utils/key-mapper";
import { useToastActions } from "../../stores/toast.store";

export function ThemeChooser() {
	const { theme, themeName } = useTheme();
	const themeStore = useThemeStore();
	const tabFocusStore = useTabFocus();
	const toastActions = useToastActions();
	const themesAvailable = themeStore.getAvailableThemes();
	const [initialTheme] = useState(themeName);
	const themesAvailableWithCallback = useCallback(() => {
		return themesAvailable.map((theme) => ({
			name: theme,
			onSelect: () => {
				themeStore.switchToTheme(theme as KeyThemeMap);
				tabFocusStore.stopCustom();
				toastActions.success(`Switched to ${theme} theme`);
			},
			onFocus: () => {
				themeStore.switchToTheme(theme as KeyThemeMap);
			},
		}));
	}, [
		themesAvailable,
		tabFocusStore.stopCustom,
		themeStore.switchToTheme,
		toastActions.success,
	]);

	const itemFocusStore = useScopedStore<{
		name: string;
		onSelect: () => void;
		onFocus: () => void;
	}>();

	useEffect(() => {
		itemFocusStore.current?.data.onFocus();
	}, [itemFocusStore.current]);

	useKeyboard((key) => {
		if (tabFocusStore.current !== "choose-theme") return;

		if (isAction(key.name, "escape")) {
			themeStore.switchToTheme(initialTheme as KeyThemeMap);
			tabFocusStore.stopCustom();
			return;
		}

		if (isAction(key.name, "return")) {
			itemFocusStore.current?.data.onSelect();
			return;
		}

		if (isAction(key.name, "up") || isAction(key.name, "down")) {
			itemFocusStore.next(
				matchKey(key.name) as YDirectionsActions,
				themesAvailableWithCallback(),
			);
			return;
		}
	});

	return (
		<box
			position="absolute"
			top={0}
			left={0}
			flexGrow={1}
			width={"100%"}
			height={"100%"}
			backgroundColor={theme.highlightBg}
			justifyContent="center"
			alignItems="center"
		>
			<box
				flexDirection="column"
				paddingLeft={2}
				paddingRight={2}
				paddingTop={1}
				paddingBottom={1}
				backgroundColor={theme.background}
			>
				<box marginBottom={1}>
					<text fg={theme.foreground}>Themes</text>
				</box>

				<box marginBottom={1}>
					<text fg={theme.muted}>
						Please choose your theme from the themes down below. Preview will be
						shown while focusing on a theme
					</text>
				</box>

				<box>
					{themesAvailableWithCallback().map((item) => (
						<box
							width={"100%"}
							{...(itemFocusStore.current?.data.name === item.name && {
								backgroundColor: theme.muted,
							})}
							flexDirection="row"
							paddingLeft={1}
							paddingRight={1}
							gap={1}
							key={item.name}
						>
							<text fg={theme.foreground}>{item.name}</text>
						</box>
					))}
				</box>

				<box marginBottom={1}></box>
			</box>
		</box>
	);
}
