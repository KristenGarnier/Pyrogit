import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useChangeRequestFocusStore } from "../../stores/change-request.focus.store";
import { useChangeRequestStore } from "../../stores/changeRequest.store";
import { Tabs, useTabFocus } from "../../stores/tab.focus.store";
import { catppuccinMochaTheme } from "../../themes/captuccin-mocha";
import { calculateColumnWidths } from "../../utils/column-width-calculator";
import {
	isAction,
	matchKey,
	type YDirectionsActions,
} from "../../utils/key-mapper";
import { PullRequestItem } from "../molecules/pull-request-item";
import { PullRequestTableHeader } from "../molecules/pull-request-table-header";
import open from "open";
import { useToastActions } from "../../stores/toast.store";
import clipboard from "clipboardy";
import { useEffect, useRef } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";

export function PullRequestManager() {
	const scrollRef = useRef<ScrollBoxRenderable>(null);
	const pullRequestStore = useChangeRequestStore();
	const tabFocusStore = useTabFocus();
	const itemFocusStore = useChangeRequestFocusStore();
	const toastActions = useToastActions();
	const prs = pullRequestStore.getPRs();

	const { height } = useTerminalDimensions();

	useKeyboard((key) => {
		if (tabFocusStore.current !== Tabs.PULL_REQUESTS) return;

		if (isAction(key.name, "return")) {
			if (!itemFocusStore.current) return;
			tabFocusStore.focusCustom(String(itemFocusStore.current?.data.id.number));
			return;
		}

		if (isAction(key.name, "up") || isAction(key.name, "down")) {
			itemFocusStore.next(matchKey(key.name) as YDirectionsActions, prs);
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
	});

	useEffect(() => {
		if (
			!scrollRef.current ||
			(!itemFocusStore.current?.index && itemFocusStore.current?.index !== 0)
		)
			return;

		const lowBound = Math.floor((height - 4) / 2);
		const highBound = prss.length - lowBound;
		const totalHeight = prs.length;
		const scrollPos = itemFocusStore.current.index;

		if (scrollPos < lowBound) return scrollRef.current.scrollTo(0);
		if (scrollPos > highBound) return scrollRef.current.scrollTo(totalHeight);

		if (Math.floor((height - 4) / 2) < itemFocusStore.current.index)
			scrollRef.current.scrollTo(
				itemFocusStore.current?.index - Math.floor((height - 4) / 2),
			);
	}, [itemFocusStore.current?.index, height]);

	const widths = calculateColumnWidths(prs);

	return (
		<box
			title="Pull requests"
			flexGrow={1}
			borderStyle="rounded"
			borderColor={
				tabFocusStore.current === Tabs.PULL_REQUESTS
					? catppuccinMochaTheme.focusedBorder
					: catppuccinMochaTheme.border
			}
		>
			<PullRequestTableHeader widths={widths} />
			<scrollbox ref={scrollRef}>
				{prs.map((item) => (
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
