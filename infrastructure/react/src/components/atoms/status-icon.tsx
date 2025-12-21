import { useTheme } from "../../hooks/use-theme";

type StatusIconProps = {
	status: "open" | "closed" | "merged";
};

export function StatusIcon({ status }: StatusIconProps) {
	const { theme } = useTheme();
	const icon = status === "open" ? "" : status === "closed" ? "" : "";
	const color =
		status === "open"
			? theme.info
			: status === "closed"
				? theme.error
				: theme.secondary;

	return <text fg={color}>{icon}</text>;
}
