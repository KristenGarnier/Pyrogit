import clipboard from "clipboardy";
import open from "open";
import type { ChangeRequest } from "../../../../../domain/change-request";
import { useTheme } from "../../hooks/use-theme";
import { useTabFocus } from "../../stores/tab.focus.store";
import { useToastActions } from "../../stores/toast.store";
import type { ColumnKey } from "../../utils/column-width-calculator";
import { truncateText } from "../../utils/column-width-calculator";
import { throttle } from "../../utils/throttle";
import { StatusIcon } from "../atoms/status-icon";
import { ContextMenu, type ContextMenuOption } from "./context-menu";
import { ReviewStatus } from "./review-status";

interface PullRequestItemProps {
	item: ChangeRequest;
	widths: Record<ColumnKey, number>;
	selected: boolean;
}

export function PullRequestItem({
	item,
	widths,
	selected,
}: PullRequestItemProps) {
	const { theme } = useTheme();
	const tabFocusStore = useTabFocus();
	const toastStore = useToastActions();

	const menuOptions: ContextMenuOption[] = [
		{
			id: "browser",
			title: "Open in browser",
			icon: "󰏌",
			onSelect: throttle(() => {
				void open(item.webUrl);
			}, 1000),
		},
		{
			id: "copy",
			title: "Copy branch name",
			icon: "",
			onSelect: throttle(() => {
				void clipboard.write(item.branch);
				toastStore.info("Branch name copied to clipboard");
			}, 1000),
		},
	];

	const isContextMenuOpen = tabFocusStore.current === String(item.id.number);

	return (
		<box
			flexDirection="row"
			gap={1}
			key={item.id.number}
			position="relative"
			{...(selected && {
				backgroundColor: theme.highlightBg,
			})}
		>
			{/* ID column */}
			<box width={widths.ID} flexDirection="row">
				<text fg={theme.muted}>#</text>
				<text fg={theme.foreground}>{item.id.number}</text>
			</box>

			{/* Status column */}
			<box width={widths.Status}>
				<StatusIcon status={item.state} />
			</box>

			{/* Title column */}
			<box width={widths.Title}>
				<text fg={theme.foreground}>
					{truncateText(item.title, widths.Title)}
				</text>
			</box>

			{/* Author column */}
			<box width={widths.Author}>
				<text fg={theme.foreground}>{item.author.login}</text>
			</box>

			{/* Target column */}
			<box width={widths.Target}>
				<text fg={theme.foreground}>{item.taget}</text>
			</box>

			{/* Review status column */}
			<box width={widths.Review} flexDirection="row" gap={1}>
				<ReviewStatus
					hasActivity={item.review.hasAnyReviewActivity}
					statusKind={item.review.myStatus.kind}
				/>
			</box>

			{/* Context menu */}
			{isContextMenuOpen && (
				<ContextMenu id={String(item.id.number)} options={menuOptions} />
			)}
		</box>
	);
}
