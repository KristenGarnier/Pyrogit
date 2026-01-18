const inFlight = new Set<AbortController>();

export function abortAll(reason = "shutdown") {
	for (const ac of inFlight) ac.abort(reason);
	inFlight.clear();
}

export async function withAbort<T>(
	fn: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
	const ac = new AbortController();
	inFlight.add(ac);

	try {
		return await fn(ac.signal);
	} finally {
		inFlight.delete(ac);
	}
}
