import { useThemeStore } from "../stores/theme.store";

export function useTheme() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const themeName = useThemeStore((state) => state.themeName);
  const selectTheme = useThemeStore((state) => state.selectTheme);

  return {
    theme: currentTheme,
    themeName,
    selectTheme,
  };
}
