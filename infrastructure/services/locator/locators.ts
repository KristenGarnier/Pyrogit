import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { err, ok } from "neverthrow";
import {
	LocatorAccessError,
	LocatorNoParentError,
} from "../../errors/LocatorError";
import type { Locator } from "./locator.interface";

function isErrnoError(err: unknown): err is Error & { code?: string } {
	return err instanceof Error && "code" in err;
}

export class GitLocator implements Locator {
	findDir() {
		let dir = process.cwd();

		while (true) {
			const gitPath = join(dir, ".git");

			try {
				const stat = statSync(gitPath);

				if (stat.isDirectory()) return ok(gitPath);

				if (stat.isFile()) return ok(gitPath);
			} catch (error: unknown) {
				if (
					isErrnoError(error) &&
					error.code !== "ENOENT" &&
					error.code !== "ENOTDIR" &&
					error.code !== "EACCES"
				) {
					return err(
						new LocatorAccessError("Could not get the .git path", {
							cause: error,
						}),
					);
				}
			}

			const parent = dirname(dir);
			if (parent === dir)
				return err(
					new LocatorNoParentError("There is not other parent to search"),
				);
			dir = parent;
		}
	}
}

export class RootLocator implements Locator {
	private locator: Locator;
	constructor() {
		this.locator = new GitLocator();
	}

	findDir() {
		const result = this.locator.findDir();
		if (result.isErr()) return result;

		return ok(result.value.replace("/.git", ""));
	}
}
