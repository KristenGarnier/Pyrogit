import type { MyReviewStatus } from "../../../../../domain/change-request";
import { useTheme } from "../../hooks/use-theme";
import { getReviewStatusConfig } from "../../utils/review-status.utils";

type ReviewStatusProps = {
	hasActivity: boolean;
	statusKind: MyReviewStatus;
};

export function ReviewStatus({ hasActivity, statusKind }: ReviewStatusProps) {
	const { theme } = useTheme();
	const config = getReviewStatusConfig(statusKind);

	return (
		<>
			{hasActivity && (
				<box flexDirection="row" gap={1}>
					<text fg={theme.success}></text>
					<text fg={theme[config.color as keyof typeof theme]}>
						{config.icon}
					</text>
					<text fg={theme.success}>Reviewed</text>
				</box>
			)}
			{!hasActivity && (
				<box flexDirection="row" gap={1}>
					<text fg={theme[config.color as keyof typeof theme]}>
						{config.icon}
					</text>
					<text fg={theme[config.color as keyof typeof theme]}>
						{config.text}
					</text>
				</box>
			)}
		</>
	);
}
