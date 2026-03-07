import { createAppCommandBus } from "../commands/registry";
import { Pyrogit } from "./pyrogit";
import { useChangeRequestStore } from "../stores/changeRequest.store";
import { useThemeStore } from "../stores/theme.store";
import { useUserStore } from "../stores/user.store";

export const pyrogit = new Pyrogit();

export const appCommandBus = createAppCommandBus({
	pyrogit,
	getThemeStore: () => useThemeStore.getState(),
	getChangeRequestStore: () => useChangeRequestStore.getState(),
	getUserStore: () => useUserStore.getState(),
});

export function useCommandBus() {
	return appCommandBus;
}
