import type { ErrorValue } from "../../../react/src/services/pyrogit";
import type { Storage } from "../storage.interface";

export class JSONParserStorage<U> implements Storage<U> {
	constructor(private readonly storage: Storage<string>) {}

	async read(): Promise<ErrorValue<U>> {
		try {
			const [data, error] = await this.storage.read();
			if (error) return [null, error];
			if (!data) return [null, new Error("No data in the file")];

			const parsed = JSON.parse(data);
			return [parsed as U, null];
		} catch (e) {
			return [null, e instanceof Error ? e : new Error(String(e))];
		}
	}

	async write(content: U): Promise<ErrorValue<boolean>> {
		try {
			const stringContent = JSON.stringify(content);
			return this.storage.write(stringContent);
		} catch (e) {
			return [false, e instanceof Error ? e : new Error(String(e))];
		}
	}
}
