import { useTheme } from "../../hooks/use-theme";
import type { ColumnKey } from "../../utils/column-width-calculator";

interface PullRequestTableHeaderProps {
	widths: Record<ColumnKey, number>;
}

export function PullRequestTableHeader({
	widths,
}: PullRequestTableHeaderProps) {
	const { theme } = useTheme();

	return (
		<box flexDirection="row" gap={1}>
			{/* ID column */}
			<box width={widths.ID}>
				<text fg={theme.muted}>ID</text>
			</box>

			{/* Status column */}
			<box width={widths.Status}>
				<text fg={theme.muted}></text>
			</box>

			{/* Title column */}
			<box width={widths.Title}>
				<text fg={theme.muted}>Title</text>
			</box>

			{/* Author column */}
			<box width={widths.Author}>
				<text fg={theme.muted}>Author</text>
			</box>

			{/* Target column */}
			<box width={widths.Target}>
				<text fg={theme.muted}>Target</text>
			</box>

			{/* Review status column */}
			<box width={widths.Review}>
				<text fg={theme.muted}>Review</text>
			</box>
		</box>
	);
}
