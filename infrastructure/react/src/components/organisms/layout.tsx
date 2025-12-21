import type { ReactNode } from "react";
import { useThemeStore } from "../../stores/theme.store";
import { ToastContainer } from "../molecules/toast-container";
import { AppFooter } from "../molecules/app-footer";

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
