import Fuse, { type IFuseOptions } from "fuse.js";
import { useCallback, useMemo } from "react";

export type UseFuseSearchOptions<T> = {
	fuse: IFuseOptions<T>;
	returnAllOnEmptyQuery?: boolean;
	limit?: number;
};

export function useFuseSearch<T>(
	items: readonly T[],
	options: UseFuseSearchOptions<T>,
) {
	const { fuse: fuseOptions, returnAllOnEmptyQuery = true, limit } = options;

	const fuse = useMemo(
		() => new Fuse(items as T[], fuseOptions),
		[items, fuseOptions],
	);

	const search = useCallback(
		(query: string) => {
			const q = query.trim();
			if (!q || q === "") {
				return returnAllOnEmptyQuery ? (items as T[]) : [];
			}

			const out = fuse.search(q).map((r) => r.item);
			return limit ? out.slice(0, limit) : out;
		},
		[fuse, items, limit, returnAllOnEmptyQuery],
	);

	return { search };
}
