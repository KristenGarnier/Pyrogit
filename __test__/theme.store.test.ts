import { describe, expect, it, beforeEach } from "bun:test";
import { themeMap } from "../infrastructure/react/src/services/theme-catalog.service";
import { useThemeStore } from "../infrastructure/react/src/stores/theme.store";
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

  it("should set theme", async () => {
    const themeName = "tokyo-night";

    await useThemeStore.getState().selectTheme(themeName);

    const state = useThemeStore.getState();
    expect(state.currentTheme).toBe(themeMap["tokyo-night"]);
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

  it("should switch to valid theme", async () => {
    await useThemeStore.getState().selectTheme("tokyo-night");

    const state = useThemeStore.getState();
    expect(state.currentTheme).toBe(themeMap["tokyo-night"]);
    expect(state.themeName).toBe("tokyo-night");
  });

  it("should fallback to default theme when setTheme receives invalid name", async () => {
    await useThemeStore.getState().selectTheme("invalid-theme");

    const state = useThemeStore.getState();
    expect(state.currentTheme).toBe(themeMap["catppuccin-mocha"]);
    expect(state.themeName).toBe("catppuccin-mocha");
  });

  it("should get available themes", () => {
    const availableThemes = useThemeStore.getState().getAvailableThemes();

    expect(availableThemes).toEqual(Object.keys(themeMap));
    expect(availableThemes).toContain("catppuccin-mocha");
    expect(availableThemes).toContain("tokyo-night");
    expect(Array.isArray(availableThemes)).toBe(true);
  });

  it("should handle theme switching cycle", async () => {
    // Switch to different theme
    await useThemeStore.getState().selectTheme("dracula");
    expect(useThemeStore.getState().themeName).toBe("dracula");

    // Switch back
    await useThemeStore.getState().selectTheme("catppuccin-mocha");
    expect(useThemeStore.getState().themeName).toBe("catppuccin-mocha");
  });
});
