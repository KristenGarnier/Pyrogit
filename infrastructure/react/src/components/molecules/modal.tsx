import type { ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { useTheme } from "../../hooks/use-theme";
import { isAction } from "../../utils/key-mapper";

type ModalProps = {
	children: ReactNode;
	onClose?: () => void;
};

type ModalHeaderProps = {
	title: string;
	description?: string;
	icon?: string;
};

type ModalContentProps = {
	children: ReactNode;
	marginBottom?: number;
};

function ModalComponent({ children, onClose }: ModalProps) {
	const { theme } = useTheme();

	useKeyboard((key) => {
		if (onClose && isAction(key.name, "escape")) {
			onClose();
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
				{children}
			</box>
		</box>
	);
}

function ModalHeader({ title, description, icon }: ModalHeaderProps) {
	const { theme } = useTheme();

	return (
		<>
			<box marginBottom={1} flexDirection="row">
				{icon && (
					<text marginRight={1} fg={theme.primary}>
						{icon}
					</text>
				)}
				<text fg={theme.foreground}>{title}</text>
			</box>

			{description && (
				<box marginBottom={1}>
					<text fg={theme.muted}>{description}</text>
				</box>
			)}
		</>
	);
}

function ModalContent({ children, marginBottom = 1 }: ModalContentProps) {
	return <box marginBottom={marginBottom}>{children}</box>;
}

export const Modal = Object.assign(ModalComponent, {
	Header: ModalHeader,
	Content: ModalContent,
});
