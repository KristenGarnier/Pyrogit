import { useTheme } from "../../hooks/use-theme";
import { useTabFocus } from "../../stores/tab.focus.store";
import { Modal } from "./modal";

const helpShortcuts = [
	{
		category: "Navigation",
		shortcuts: [
			{ keys: ["h", "left"], action: "Move left", context: "Lists, menus" },
			{ keys: ["l", "right"], action: "Move right", context: "Lists, menus" },
			{ keys: ["k", "up"], action: "Move up", context: "Lists, menus" },
			{ keys: ["j", "down"], action: "Move down", context: "Lists, menus" },
			{
				keys: ["tab"],
				action: "Switch between tabs",
				context: "Main interface",
			},
		],
	},
	{
		category: "Actions",
		shortcuts: [
			{ keys: ["return"], action: "Select/Confirm", context: "Buttons, links" },
			{
				keys: ["escape", "q"],
				action: "Cancel/Close",
				context: "Modals, menus",
			},
			{ keys: ["?"], action: "Open help", context: "Global" },
			{ keys: ["t"], action: "Open themes", context: "Global" },
		],
	},
];

export function HelpModal() {
	const { theme } = useTheme();
	const tabFocusStore = useTabFocus();

	return (
		<Modal
			onClose={() => {
				tabFocusStore.stopCustom();
			}}
		>
			<Modal.Header
				title="Help & Keyboard Shortcuts"
				icon="󰘥"
				description="List of all available keyboard shortcuts and actions in the application"
			/>

			{helpShortcuts.map((category) => (
				<Modal.Content key={category.category}>
					<box marginBottom={1}>
						<text fg={theme.info}>{category.category}</text>
					</box>

					{category.shortcuts.map((shortcut) => (
						<box
							key={shortcut.action}
							flexDirection="row"
							marginBottom={1}
							paddingLeft={2}
						>
							<box width={20}>
								<text fg={theme.foreground}>
									{shortcut.keys
										.map((key) => `[${key.toLocaleLowerCase()}]`)
										.join(" ")}
								</text>
							</box>
							<box width={25}>
								<text fg={theme.foreground}>{shortcut.action}</text>
							</box>
							<box flexGrow={1}>
								<text fg={theme.muted}>({shortcut.context})</text>
							</box>
						</box>
					))}
				</Modal.Content>
			))}

			<Modal.Content>
				<box marginTop={1}>
					<text fg={theme.muted}>Tip: Press ESC to close this help modal</text>
				</box>
			</Modal.Content>
		</Modal>
	);
}
