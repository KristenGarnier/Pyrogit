import { TextAttributes } from "@opentui/core";
import { useState } from "react";
import { useTheme } from "../../hooks/use-theme";
import { Pyrogit } from "../../services/pyrogit";
import { useToastActions } from "../../stores/toast.store";
import type { ChangeRequestService } from "../../../../../application/usecases/change-request.service";
import { Modal } from "./modal";

type GhLoginProps = {
	onSuccess: (instance: ChangeRequestService) => void;
};

export function GhLogin({ onSuccess }: GhLoginProps) {
	const { theme } = useTheme();
	const toast = useToastActions();
	const [loading, setLoading] = useState(false);

	async function login() {
		setLoading(true);
		const pyro = new Pyrogit();
		const [initError, instance] = await pyro.init();
		if (initError) {
			setLoading(false);
			toast.error(initError.message);
			return;
		}

		toast.success("Login successful");
		setLoading(false);
		onSuccess(instance as ChangeRequestService);
	}

	return (
		<Modal>
			<Modal.Header
				title="GitHub Login Required"
				icon="🔐"
				description="Please authenticate with GitHub CLI first."
			/>

			<Modal.Content>
				<text>Run the following command in another terminal:</text>
				<text fg={theme.primary} attributes={TextAttributes.BOLD}>
					gh auth login
				</text>
				<text>Then click "Continue" below.</text>
			</Modal.Content>

			<Modal.Content>
				<box flexDirection="row" gap={1}>
					<button type="button" onClick={login} disabled={loading}>
						{loading ? "Checking..." : "Continue"}
					</button>
				</box>
			</Modal.Content>

			<Modal.Content>
				<box flexDirection="row" gap={1}>
					{loading && (
						<text fg={theme.info} attributes={TextAttributes.DIM}>
							Authenticating...
						</text>
					)}
				</box>
			</Modal.Content>
		</Modal>
	);
}
