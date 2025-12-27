import { create } from "zustand";

type TabFocusState = {
	current: TabValue | (string & {});
	previous: TabValue | (string & {});

	cycle: () => void;
	focusCustom: (name: string) => void;
	stopCustom: () => void;
	reset: () => void;
};

export const Tabs = {
	PULL_REQUESTS: "pull_requests",
	VIEWS: "views",
} as const;

export type TabValue = (typeof Tabs)[keyof typeof Tabs];

export const TAB_VALUES = [Tabs.PULL_REQUESTS, Tabs.VIEWS];

const initalFocus = Tabs.PULL_REQUESTS;

export const useTabFocus = create<TabFocusState>((set) => ({
	current: initalFocus,
	previous: initalFocus,

	cycle: () =>
		set((state) => {
			if (!TAB_VALUES.includes(state.current as TabValue)) return state;
			return {
				current: getNextTab(state.current as TabValue, initalFocus),
				previous: state.current,
			};
		}),

	focusCustom: (name: string) =>
		set((state) => {
			const isPane = TAB_VALUES.includes(state.current as TabValue);

			return {
				current: name,
				previous: isPane ? state.current : state.previous,
			};
		}),

	stopCustom: () =>
		set((state) => {
			return { current: state.previous, previous: state.current };
		}),

	reset: () =>
		set({
			current: undefined,
		}),
}));

export function getNextTab(
	current: TabValue,
	defaultFocus: TabValue,
): TabValue {
	const index = TAB_VALUES.indexOf(current);
	const nextIndex = (index + 1) % TAB_VALUES.length;
	if (TAB_VALUES[nextIndex]) return TAB_VALUES[nextIndex];

	return defaultFocus;
}
