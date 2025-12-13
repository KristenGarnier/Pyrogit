import * as fs from "node:fs/promises";
import type { ErrorValue } from "../../react/src/services/pyrogit";
import type { Storage } from "./storage.interface";

export class FileStorage implements Storage<string> {
	constructor(private readonly filePath: string) {}

	async read(): Promise<ErrorValue<string>> {
		try {
			const content = await fs.readFile(this.filePath, "utf8");
			return [content, null];
		} catch (e) {
			return [null, e instanceof Error ? e : new Error(String(e))];
		}
	}

	async write(content: string): Promise<ErrorValue<boolean>> {
		try {
			await fs.writeFile(this.filePath, content, "utf8");
			return [true, null];
		} catch (e) {
			return [false, e instanceof Error ? e : new Error(String(e))];
		}
	}
}
