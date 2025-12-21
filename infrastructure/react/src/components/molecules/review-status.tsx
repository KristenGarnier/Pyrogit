import { useTheme } from "../../hooks/use-theme";

type ReviewStatusProps = {
	hasActivity: boolean;
	statusKind: string;
};

export function ReviewStatus({ hasActivity, statusKind }: ReviewStatusProps) {
	const { theme } = useTheme();
	const activityIcon = hasActivity ? "" : "󰚭";

	return (
		<>
			<text fg={theme.warning}>{activityIcon}</text>
			<text fg={theme.warning}>{statusKind}</text>
		</>
	);
}
