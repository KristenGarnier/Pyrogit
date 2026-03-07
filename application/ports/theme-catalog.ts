export type ThemeSnapshot<TTheme> = {
	name: string;
	theme: TTheme;
};

export interface ThemeCatalog<TTheme> {
	getDefault(): ThemeSnapshot<TTheme>;
	resolveByName(name: string): ThemeSnapshot<TTheme>;
	getAvailableNames(): string[];
}
