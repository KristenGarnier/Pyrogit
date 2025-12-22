import * as fs from "node:fs/promises";
import type { ErrorValue } from "../../react/src/services/pyrogit";
import type { Storage } from "./storage.interface";

export class FileStorage implements Storage<string> {
	constructor(private readonly filePath: string) {}

	async read(): Promise<ErrorValue<string>> {
		try {
			const content = await fs.readFile(this.filePath, "utf8");
			return [null, content];
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return [error, null];
		}
	}

	async write(content: string): Promise<ErrorValue<boolean>> {
		try {
			await fs.writeFile(this.filePath, content, "utf8");
			return [null, true];
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return [error, null];
		}
	}
}
