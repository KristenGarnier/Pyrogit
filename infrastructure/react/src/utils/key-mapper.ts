export const yDirections = {
	up: ["up", "k"],
	down: ["down", "j"],
};
export type YDirectionsActions = keyof typeof yDirections;

export const xDirection = {
	left: ["left", "h"],
	right: ["right", "l"],
};
export type xDirectionActions = keyof typeof xDirection;

export const keyDefintion = {
	...xDirection,
	...yDirections,
	return: ["return"],
	escape: ["escape", "q"],
	tab: ["tab"],
};

export type SupportedActions = keyof typeof keyDefintion;

export const keyMap = Object.entries(keyDefintion).reduce(
	(previous, current) => {
		const [action, keys] = current as [SupportedActions, string[]];
		for (const key of keys) {
			previous.set(key, action);
		}

		return previous;
	},
	new Map<string, SupportedActions>(),
);

export function matchKey(key: string): SupportedActions | null {
	const mappedKey = keyMap.get(key);
	if (!mappedKey) return null;

	return mappedKey;
}

export function isAction(
	key: string,
	action: SupportedActions | SupportedActions[],
): boolean {
	const foundAction = matchKey(key);
	if (Array.isArray(action))
		return action.includes(foundAction as SupportedActions);
	return foundAction === action;
}
