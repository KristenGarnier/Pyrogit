import { err, ok, Result, type Result as ResultType } from "neverthrow";
import type { ThemeCatalog, ThemeSnapshot } from "../ports/theme-catalog";
import type { Storage } from "../../infrastructure/services/storage/storage.interface";

type Deps<TTheme> = {
	storage: Storage<string>;
	themeCatalog: ThemeCatalog<TTheme>;
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function extractThemeName(payload: unknown): string | null {
	if (typeof payload === "string") return payload;
	if (!isObject(payload)) return null;

	if (typeof payload.themeName === "string") return payload.themeName;
	if (isObject(payload.state) && typeof payload.state.themeName === "string") {
		return payload.state.themeName;
	}

	return null;
}

export class ThemePreferenceService<TTheme> {
	private hydrated = false;
	private selection: ThemeSnapshot<TTheme>;

	constructor(private readonly deps: Deps<TTheme>) {
		this.selection = deps.themeCatalog.getDefault();
	}

	get(): ResultType<ThemeSnapshot<TTheme>, Error> {
		return ok(this.selection);
	}

	async hydrate(): Promise<ResultType<ThemeSnapshot<TTheme>, Error>> {
		if (this.hydrated) return ok(this.selection);

		const readResult = await this.deps.storage.read();
		this.hydrated = true;

		if (readResult.isErr() || !readResult.value) {
			this.selection = this.deps.themeCatalog.getDefault();
			return ok(this.selection);
		}

		const parsedPayload = Result.fromThrowable(
			() => JSON.parse(readResult.value),
			(error) =>
				new Error("Could not parse persisted theme", {
					cause: error,
				}),
		)();

		if (parsedPayload.isErr()) return err(parsedPayload.error);

		const persistedThemeName = extractThemeName(parsedPayload.value);
		this.selection = this.deps.themeCatalog.resolveByName(
			persistedThemeName ?? this.deps.themeCatalog.getDefault().name,
		);

		return ok(this.selection);
	}

	async setThemeName(themeName: string): Promise<ResultType<ThemeSnapshot<TTheme>, Error>> {
		this.selection = this.deps.themeCatalog.resolveByName(themeName);
		this.hydrated = true;

		const writeResult = await this.deps.storage.write(
			JSON.stringify({ themeName: this.selection.name }),
		);
		if (writeResult.isErr()) return err(writeResult.error);

		return ok(this.selection);
	}

	getAvailableThemes(): ResultType<string[], Error> {
		return ok(this.deps.themeCatalog.getAvailableNames());
	}
}
