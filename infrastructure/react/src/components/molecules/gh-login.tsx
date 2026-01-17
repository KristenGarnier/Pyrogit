import { TextAttributes } from "@opentui/core";
import { useTheme } from "../../hooks/use-theme";
import { Modal } from "./modal";

export function GhLogin() {
	const { theme } = useTheme();

	return (
		<Modal>
			<Modal.Header
				title="GitHub Login Required"
				icon="🔐"
				description="Please authenticate with GitHub CLI first."
			/>

			<Modal.Content>
				<box marginBottom={1}>
					<text>It seems that gh cli is not installed</text>
					<text>Or auth login has not been done.</text>
				</box>
				<box marginBottom={1}>
					<text>Please follow the procedure below : </text>
				</box>
				<box
					gap={1}
					marginBottom={1}
					backgroundColor={theme.highlightBg}
					padding={1}
				>
					<box>
						<text fg={theme.primary} attributes={TextAttributes.BOLD}>
							Install gh CLI with your tool of choice :
						</text>
						<text fg={theme.primary} attributes={TextAttributes.BOLD}>
							https://github.com/cli/cli#installation
						</text>
					</box>

					<text>When gh is installed and available in the terminal</text>
					<text>use the following command : </text>

					<text fg={theme.primary} attributes={TextAttributes.BOLD}>
						gh auth login
					</text>
				</box>
				<text>Once done, Restart Pyrogit</text>
			</Modal.Content>
		</Modal>
	);
}
