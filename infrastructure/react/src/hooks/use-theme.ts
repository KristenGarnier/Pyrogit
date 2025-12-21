import { useThemeStore } from "../stores/theme.store";

export function useTheme() {
	const currentTheme = useThemeStore((state) => state.currentTheme);
	const themeName = useThemeStore((state) => state.themeName);
	const setTheme = useThemeStore((state) => state.setTheme);

	return {
		theme: currentTheme,
		themeName,
		setTheme,
	};
}
