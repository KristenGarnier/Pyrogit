import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useChangeRequestFocusStore } from "../../stores/change-request.focus.store";
import { useChangeRequestStore } from "../../stores/changeRequest.store";
import { Tabs, useTabFocus } from "../../stores/tab.focus.store";
import { calculateColumnWidths } from "../../utils/column-width-calculator";
import {
	isAction,
	matchKey,
	type YDirectionsActions,
} from "../../utils/key-mapper";
import { PullRequestItem } from "../molecules/pull-request-item";
import { PullRequestTableHeader } from "../molecules/pull-request-table-header";
import { useAutoScroll } from "../../hooks/use-auto-scroll";
import open from "open";
import { useToastActions } from "../../stores/toast.store";
import clipboard from "clipboardy";
import { useMemo, useRef, useState } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { useTheme } from "../../hooks/use-theme";
import { useFuseSearch } from "../../hooks/use-fuse-search";

export function PullRequestManager() {
	const scrollRef = useRef<ScrollBoxRenderable>(null);
	const { prs, setFilter, filter } = useChangeRequestStore();
	const tabFocusStore = useTabFocus();
	const itemFocusStore = useChangeRequestFocusStore();
	const toastActions = useToastActions();
	const { theme } = useTheme();

	const fuseOptions = useMemo(
		() => ({
			threshold: 0.35,
			ignoreLocation: true,
			minMatchCharLength: 2,
			keys: [
				{ name: "title", weight: 0.55 },
				{ name: "id.owner", weight: 0.1 },
				{ name: "id.repo", weight: 0.12 },
				{ name: "author.login", weight: 0.12 },
				{ name: "author.displayName", weight: 0.08 },
				{ name: "taget", weight: 0.12 },
				{ name: "branch", weight: 0.08 },
				{ name: "review.myStatusText", weight: 0.06 },
			],
		}),
		[],
	);

	const { search } = useFuseSearch(prs, {
		fuse: fuseOptions,
		returnAllOnEmptyQuery: true,
	});

	const filterablePrs = search(filter);

	const [searchMode, setSearchMode] = useState(false);

	const { height } = useTerminalDimensions();

	useAutoScroll(
		scrollRef,
		height,
		itemFocusStore.current?.index,
		filterablePrs.length,
	);

	useKeyboard((key) => {
		if (tabFocusStore.current !== Tabs.PULL_REQUESTS) return;

		if (searchMode) {
			if (isAction(key.name, "escape")) {
				if (searchMode) setSearchMode(false);
				setFilter("");
				toastActions.info("Search cleared");
				tabFocusStore.enable();
			}

			if (isAction(key.name, "return")) {
				if (!searchMode) return;

				setSearchMode(false);
				tabFocusStore.enable();
			}

			return;
		}

		if (isAction(key.name, "return")) {
			if (!itemFocusStore.current) return;
			tabFocusStore.focusCustom(String(itemFocusStore.current?.data.id.number));
			return;
		}

		if (isAction(key.name, "up") || isAction(key.name, "down")) {
			itemFocusStore.next(
				matchKey(key.name) as YDirectionsActions,
				filterablePrs,
			);
		}

		if (isAction(key.name, "opening")) {
			const url = itemFocusStore.current?.data.webUrl;
			if (!url) return toastActions.error("Could not open PR : url not found");

			void open(url);
		}

		if (isAction(key.name, "copy")) {
			const branch = itemFocusStore.current?.data.branch;
			if (!branch)
				return toastActions.error(
					"Could not copy the branch name : branch not found",
				);

			void clipboard.write(branch);
			toastActions.info("Branch name copied to clipboard");
		}

		if (isAction(key.name, "search")) {
			tabFocusStore.disable();
			setSearchMode(true);
		}
	});

	const widths = calculateColumnWidths(prs);

	return (
		<box
			title="Pull requests"
			flexGrow={1}
			borderStyle="rounded"
			borderColor={
				tabFocusStore.current === Tabs.PULL_REQUESTS
					? theme.focusedBorder
					: theme.border
			}
		>
			{(searchMode || filter !== "") && (
				<box
					title="Search"
					borderStyle="rounded"
					borderColor={searchMode ? theme.focusedBorder : theme.muted}
					backgroundColor={theme.background}
					height={3}
				>
					<input
						backgroundColor={theme.background}
						focused={searchMode}
						value={filter}
						placeholder="Search query"
						onInput={setFilter}
					/>
				</box>
			)}
			<PullRequestTableHeader widths={widths} />
			<scrollbox ref={scrollRef}>
				{filterablePrs.map((item) => (
					<PullRequestItem
						key={item.id.number}
						item={item}
						selected={itemFocusStore.current?.data.id.number === item.id.number}
						widths={widths}
					/>
				))}
			</scrollbox>
		</box>
	);
}
