import { describe, expect, it, beforeEach } from "bun:test";
import {
	useTabFocus,
	Tabs,
	TAB_VALUES,
	getNextTab,
} from "../infrastructure/react/src/stores/tab.focus.store";

describe("getNextTab", () => {
	it("should cycle to next tab", () => {
		expect(getNextTab(Tabs.PULL_REQUESTS, Tabs.PULL_REQUESTS)).toBe(Tabs.VIEWS);
		expect(getNextTab(Tabs.VIEWS, Tabs.PULL_REQUESTS)).toBe(Tabs.PULL_REQUESTS);
	});

	it("should return default when tab not found", () => {
		expect(getNextTab("unknown" as any, Tabs.PULL_REQUESTS)).toBe(
			Tabs.PULL_REQUESTS,
		);
	});
});

describe("useTabFocus", () => {
	beforeEach(() => {
		// Reset store state before each test
		useTabFocus.setState({
			current: Tabs.PULL_REQUESTS,
			previous: Tabs.PULL_REQUESTS,
			disabled: false,
		});
	});

	it("should have initial state", () => {
		const state = useTabFocus.getState();

		expect(state.current).toBe(Tabs.PULL_REQUESTS);
		expect(state.previous).toBe(Tabs.PULL_REQUESTS);
		expect(state.disabled).toBe(false);
	});

	it("should cycle through tabs", () => {
		useTabFocus.getState().cycle();

		let state = useTabFocus.getState();
		expect(state.current).toBe(Tabs.VIEWS);
		expect(state.previous).toBe(Tabs.PULL_REQUESTS);

		useTabFocus.getState().cycle();

		state = useTabFocus.getState();
		expect(state.current).toBe(Tabs.PULL_REQUESTS);
		expect(state.previous).toBe(Tabs.VIEWS);
	});

	it("should focus custom tab", () => {
		useTabFocus.getState().focusCustom("custom-tab");

		const state = useTabFocus.getState();
		expect(state.current).toBe("custom-tab");
		expect(state.previous).toBe(Tabs.PULL_REQUESTS); // initial tab
	});

	it("should stop custom focus and return to previous", () => {
		useTabFocus.getState().focusCustom("custom-tab");
		expect(useTabFocus.getState().current).toBe("custom-tab");

		useTabFocus.getState().stopCustom();

		const state = useTabFocus.getState();
		expect(state.current).toBe(Tabs.PULL_REQUESTS);
		expect(state.previous).toBe("custom-tab");
	});

	it("should reset current tab", () => {
		useTabFocus.getState().cycle(); // go to views
		expect(useTabFocus.getState().current).toBe(Tabs.VIEWS);

		useTabFocus.getState().reset();

		const state = useTabFocus.getState();
		expect(state.current).toBeUndefined();
	});

	it("should disable and enable focus", () => {
		useTabFocus.getState().disable();

		expect(useTabFocus.getState().disabled).toBe(true);

		useTabFocus.getState().enable();

		expect(useTabFocus.getState().disabled).toBe(false);
	});

	it("should not cycle when current is custom tab", () => {
		useTabFocus.getState().focusCustom("custom-tab");

		const stateBefore = useTabFocus.getState();
		useTabFocus.getState().cycle();

		const stateAfter = useTabFocus.getState();
		expect(stateAfter.current).toBe(stateBefore.current);
	});
});
