import * as fs from "node:fs/promises";
import { err, ok, type Result } from "neverthrow";
import type { Storage } from "./storage.interface";

export class FileStorage implements Storage<string> {
	constructor(private readonly filePath: string) {}

	async read(): Promise<Result<string, Error>> {
		try {
			const content = await fs.readFile(this.filePath, "utf8");
			return ok(content);
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return err(error);
		}
	}

	async write(content: string): Promise<Result<boolean, Error>> {
		try {
			await fs.writeFile(this.filePath, content, "utf8");
			return ok(true);
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return err(error);
		}
	}
}
