import type { MyReviewStatus, OverallStatus } from "../../../../../domain/change-request";
import { useTheme } from "../../hooks/use-theme";
import { getReviewStatusConfig } from "../../utils/review-status.utils";

type ReviewStatusProps = {
  statusOverall: OverallStatus;
  statusMe: MyReviewStatus;
};

export function ReviewStatus({ statusOverall, statusMe }: ReviewStatusProps) {
  const { theme } = useTheme();
  const config = getReviewStatusConfig(statusOverall, statusMe);

  return (
    <box flexDirection="row" gap={1}>
      <text fg={theme[config.color as keyof typeof theme]}>{config.icon}</text>
      <text fg={theme[config.color as keyof typeof theme]}>{config.text}</text>
    </box>
  );
}
