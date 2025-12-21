import { useKeyboard } from "@opentui/react";
import { useChangeRequestFocusStore } from "../../stores/change-request.focus.store";
import { useChangeRequestStore } from "../../stores/changeRequest.store";
import { Tabs, useTabFocus } from "../../stores/tab.focus.store";
import { catppuccinMochaTheme } from "../../themes/captuccin-mocha";
import { calculateColumnWidths } from "../../utils/column-width-calculator";
import { PullRequestItem } from "../molecules/pull-request-item";
import { PullRequestTableHeader } from "../molecules/pull-request-table-header";
import {
	isAction,
	matchKey,
	type YDirectionsActions,
} from "../../utils/key-mapper";

export function PullRequestManager() {
	const pullRequestStore = useChangeRequestStore();
	const tabFocusStore = useTabFocus();
	const itemFocusStore = useChangeRequestFocusStore();
	const prs = pullRequestStore.getPRs();

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
	});

	const widths = calculateColumnWidths(prs);

	return (
		<scrollbox
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
			{prs.map((item) => (
				<PullRequestItem
					key={item.id.number}
					item={item}
					selected={itemFocusStore.current?.data.id.number === item.id.number}
					widths={widths}
				/>
			))}
		</scrollbox>
	);
}
