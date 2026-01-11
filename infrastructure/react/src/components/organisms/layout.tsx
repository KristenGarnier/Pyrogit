import type { ReactNode } from "react";
import { useThemeStore } from "../../stores/theme.store";
import { AppFooter } from "../molecules/app-footer";
import { ToastContainer } from "../molecules/toast-container";

type LayoutProps = {
	children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
	const { currentTheme } = useThemeStore();
	return (
		<box backgroundColor={currentTheme.background}>
			{children}
			<ToastContainer />
			<AppFooter />
		</box>
	);
}
