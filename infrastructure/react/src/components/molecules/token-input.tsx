import { TextAttributes } from "@opentui/core";
import { useState } from "react";
import { useTheme } from "../../hooks/use-theme";
import { Pyrogit } from "../../services/pyrogit";
import { useToastActions } from "../../stores/toast.store";
import type { ChangeRequestService } from "../../../../../application/usecases/change-request.service";

type TokenInputProps = {
	onSuccess: (instance: ChangeRequestService) => void;
};

export function TokenInput({ onSuccess }: TokenInputProps) {
	const { theme } = useTheme();
	const toast = useToastActions();
	const [value, setValue] = useState("");
	const [loading, setLoading] = useState(false);

	async function submitToken() {
		setLoading(true);
		const pyro = new Pyrogit();
		const [error, instance] = await pyro.init(value);
		if (error) {
			setLoading(false);
			toast.error(error.message);
			return;
		}

		toast.success("Token initialisation success");
		setLoading(false);
		onSuccess(instance as ChangeRequestService);
	}

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
					<text fg={theme.foreground}>🔐 GitHub Token Required</text>
				</box>

				<box marginBottom={1}>
					<text fg={theme.muted}>
						Please enter your GitHub personal access token to continue.
					</text>
				</box>

				<box marginBottom={1}>
					<input
						placeholder="Enter token..."
						value={value}
						onInput={setValue}
						onSubmit={submitToken}
						onPaste={(event) => setValue(event.text)}
						focused
					/>
				</box>

				<box flexDirection="row" gap={1}>
					{loading && (
						<text fg={theme.info} attributes={TextAttributes.DIM}>
							Verifying token...
						</text>
					)}
				</box>
			</box>
		</box>
	);
}
