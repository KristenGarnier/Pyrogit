import type { ErrorValue } from "../../../react/src/services/pyrogit";
import type { Storage } from "../storage.interface";

export class JSONParserStorage<U> implements Storage<U> {
	constructor(private readonly storage: Storage<string>) {}

	async read(): Promise<ErrorValue<U>> {
		try {
			const [error, data] = await this.storage.read();
			if (error) return [error, null];
			if (!data) return [new Error("No data in the file"), null];

			const parsed = JSON.parse(data);
			return [null, parsed as U];
		} catch (e) {
			return [e instanceof Error ? e : new Error(String(e)), null];
		}
	}

	async write(content: U): Promise<ErrorValue<boolean>> {
		try {
			const stringContent = JSON.stringify(content);
			return this.storage.write(stringContent);
		} catch (e) {
			return [e instanceof Error ? e : new Error(String(e)), null];
		}
	}
}
