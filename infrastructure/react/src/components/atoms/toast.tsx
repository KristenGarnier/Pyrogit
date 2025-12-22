import { useTheme } from "../../hooks/use-theme";

type ToastType = "info" | "success" | "warning" | "error";

type ToastProps = {
	message: string;
	type?: ToastType;
};

export function Toast({ message, type = "info" }: ToastProps) {
	const { theme } = useTheme();

	const typeColors = {
		info: theme.info,
		success: theme.success,
		warning: theme.warning,
		error: theme.error,
	};

	return (
		<box
			backgroundColor={theme.highlightBg}
			paddingRight={1}
			gap={1}
			flexDirection="row"
		>
			<box width={1} backgroundColor={typeColors[type]}></box>
			<text fg={theme.foreground}>{message}</text>
		</box>
	);
}
