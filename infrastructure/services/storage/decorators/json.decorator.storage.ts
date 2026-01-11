import { err, ok, type Result } from "neverthrow";
import type { Storage } from "../storage.interface";

export class JSONParserStorage<U> implements Storage<U> {
	constructor(private readonly storage: Storage<string>) {}

	async read(): Promise<Result<U, Error>> {
		const readResult = await this.storage.read();
		if (readResult.isErr()) return err(readResult.error);
		const data = readResult.value;
		if (!data) return err(new Error("No data in the file"));

		try {
			const parsed = JSON.parse(data);
			return ok(parsed as U);
		} catch (e) {
			return err(e instanceof Error ? e : new Error(String(e)));
		}
	}

	async write(content: U): Promise<Result<boolean, Error>> {
		try {
			const stringContent = JSON.stringify(content);
			return this.storage.write(stringContent);
		} catch (e) {
			return err(e instanceof Error ? e : new Error(String(e)));
		}
	}
}
