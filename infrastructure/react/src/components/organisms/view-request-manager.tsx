import { useTheme } from "../../hooks/use-theme";
import { Tabs, useTabFocus } from "../../stores/tab.focus.store";

export function ViewRequestManager() {
	const { theme } = useTheme();
	const tabFocusStore = useTabFocus();

	return (
		<scrollbox
			title="Views"
			width={"20%"}
			borderStyle="rounded"
			borderColor={
				tabFocusStore.current === Tabs.VIEWS
					? theme.focusedBorder
					: theme.border
			}
		>
			<text>Example view</text>
		</scrollbox>
	);
}
