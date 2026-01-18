import { useKeyboard } from "@opentui/react";
import { useCallback, useEffect, useState } from "react";
import { useScopedStore } from "../../hooks/use-scoped-store";
import { useTheme } from "../../hooks/use-theme";
import { useTabFocus } from "../../stores/tab.focus.store";
import { type KeyThemeMap, useThemeStore } from "../../stores/theme.store";
import { useToastActions } from "../../stores/toast.store";
import {
	isAction,
	matchKey,
	type YDirectionsActions,
} from "../../utils/key-mapper";
import { Modal } from "./modal";

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
		<Modal
			onClose={() => {
				themeStore.switchToTheme(initialTheme as KeyThemeMap);
				tabFocusStore.stopCustom();
			}}
		>
			<Modal.Header
				title="Themes"
				icon=""
				description="Please choose your theme from the themes down below. Preview will be shown while focusing on a theme"
			/>

			<Modal.Content marginBottom={0}>
				{themesAvailableWithCallback().map((item) => (
					<box
						key={item.name}
						width={"100%"}
						{...(itemFocusStore.current?.data.name === item.name && {
							backgroundColor: theme.muted,
						})}
						flexDirection="row"
						paddingLeft={1}
						paddingRight={1}
						gap={1}
					>
						<text fg={theme.foreground}>{item.name}</text>
					</box>
				))}
			</Modal.Content>
		</Modal>
	);
}
