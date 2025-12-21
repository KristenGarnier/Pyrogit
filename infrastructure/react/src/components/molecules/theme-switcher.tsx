import { useKeyboard } from "@opentui/react";
import { useTheme } from "../../hooks/use-theme";
import { useToastActions } from "../../stores/toast.store";

export function ThemeSwitcher() {
	const { theme, themeName, setTheme } = useTheme();
	const toastStore = useToastActions();

	// Pour l'instant, nous n'avons qu'un seul thème
	// Ceci est une démonstration de comment changer de thème
	useKeyboard((key) => {
		if (key.name === "t") {
			toastStore.info(`Thème actuel: ${themeName}`);
			toastStore.info("Appuyez sur F2 pour changer (non implémenté)");
		}

		if (key.name === "F2") {
			toastStore.warning(
				"Changement de thème non implémenté - ajoutez d'autres thèmes !",
			);
		}
	});

	return (
		<box flexDirection="row" gap={1}>
			<text
				fg={themeName === "catppuccin-mocha" ? theme.highlightBg : theme.muted}
			>
				🎨
			</text>
			<text fg={theme.muted}>{themeName}</text>
		</box>
	);
}
