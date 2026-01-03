import { describe, expect, it, beforeEach } from "bun:test";
import {
	useThemeStore,
	themeMap,
} from "../infrastructure/react/src/stores/theme.store";
import { catppuccinMochaTheme } from "../infrastructure/react/src/themes";

describe("themeMap", () => {
	it("should contain expected themes", () => {
		expect(Object.keys(themeMap)).toContain("catppuccin-mocha");
		expect(Object.keys(themeMap)).toContain("tokyo-night");
		expect(Object.keys(themeMap)).toContain("dracula");
		expect(themeMap["catppuccin-mocha"]).toBeDefined();
		expect(themeMap["tokyo-night"]).toBeDefined();
	});
});

describe("useThemeStore", () => {
	beforeEach(() => {
		// Reset store state before each test
		useThemeStore.setState({
			currentTheme: catppuccinMochaTheme,
			themeName: "catppuccin-mocha",
		});
	});

	it("should have initial state", () => {
		const state = useThemeStore.getState();

		expect(state.currentTheme).toBeDefined();
		expect(state.themeName).toBe("catppuccin-mocha");
	});

	it("should set theme", () => {
		const newTheme = themeMap["tokyo-night"];
		const themeName = "tokyo-night";

		useThemeStore.getState().setTheme(newTheme, themeName);

		const state = useThemeStore.getState();
		expect(state.currentTheme).toBe(newTheme);
		expect(state.themeName).toBe(themeName);
	});

	it("should get current theme", () => {
		const currentTheme = useThemeStore.getState().getCurrentTheme();

		expect(currentTheme).toBe(catppuccinMochaTheme);
	});

	it("should get theme name", () => {
		const themeName = useThemeStore.getState().getThemeName();

		expect(themeName).toBe("catppuccin-mocha");
	});

	it("should switch to valid theme", () => {
		useThemeStore.getState().switchToTheme("tokyo-night");

		const state = useThemeStore.getState();
		expect(state.currentTheme).toBe(themeMap["tokyo-night"]);
		expect(state.themeName).toBe("tokyo-night");
	});

	it("should not switch to invalid theme", () => {
		const originalState = useThemeStore.getState();

		useThemeStore.getState().switchToTheme("invalid-theme");

		const newState = useThemeStore.getState();
		expect(newState.currentTheme).toBe(originalState.currentTheme);
		expect(newState.themeName).toBe(originalState.themeName);
	});

	it("should get available themes", () => {
		const availableThemes = useThemeStore.getState().getAvailableThemes();

		expect(availableThemes).toEqual(Object.keys(themeMap));
		expect(availableThemes).toContain("catppuccin-mocha");
		expect(availableThemes).toContain("tokyo-night");
		expect(Array.isArray(availableThemes)).toBe(true);
	});

	it("should handle theme switching cycle", () => {
		// Switch to different theme
		useThemeStore.getState().switchToTheme("dracula");
		expect(useThemeStore.getState().themeName).toBe("dracula");

		// Switch back
		useThemeStore.getState().switchToTheme("catppuccin-mocha");
		expect(useThemeStore.getState().themeName).toBe("catppuccin-mocha");
	});
});
