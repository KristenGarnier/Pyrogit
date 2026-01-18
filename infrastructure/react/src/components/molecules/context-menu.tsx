import { useKeyboard } from "@opentui/react";
import { useScopedStore } from "../../hooks/use-scoped-store";
import { useTheme } from "../../hooks/use-theme";
import { useTabFocus } from "../../stores/tab.focus.store";
import {
	isAction,
	matchKey,
	type YDirectionsActions,
} from "../../utils/key-mapper";

export type ContextMenuOption = {
	id: string;
	icon: string;
	title: string;
	onSelect: () => void;
};

type ContextMenuProps = {
	id: string;
	options: ContextMenuOption[];
};

export function ContextMenu({ id, options }: ContextMenuProps) {
	const { theme } = useTheme();
	const tabFocusStore = useTabFocus();
	const itemFocusStore = useScopedStore(options[0]);

	useKeyboard((key) => {
		if (tabFocusStore.current !== id) return;

		if (isAction(key.name, "escape")) {
			tabFocusStore.stopCustom();
			return;
		}

		if (isAction(key.name, "return")) {
			itemFocusStore.current?.data.onSelect();
			tabFocusStore.stopCustom();
			return;
		}

		if (isAction(key.name, "up") || isAction(key.name, "down")) {
			itemFocusStore.next(matchKey(key.name) as YDirectionsActions, options);
			return;
		}
	});

	return (
		<box
			position="absolute"
			top={0}
			right={0}
			flexDirection="column"
			backgroundColor={theme.highlightBg}
		>
			{options.map((item) => (
				<box
					key={item.id}
					width={"100%"}
					{...(itemFocusStore.current?.data.id === item.id &&
						tabFocusStore.current === id && {
							backgroundColor: theme.muted,
						})}
					flexDirection="row"
					paddingLeft={1}
					paddingRight={1}
					gap={1}
				>
					<text fg={theme.foreground}>{item.icon}</text>
					<text fg={theme.foreground}>{item.title}</text>
				</box>
			))}
		</box>
	);
}
