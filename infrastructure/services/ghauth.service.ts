import { execSync } from "node:child_process";
import { err, ok, type Result } from "neverthrow";
import { GHTokenRetrievalError } from "../errors/GHTokenRetrievalError";

export class GhAuthService {
	async getValidToken(): Promise<Result<string, GHTokenRetrievalError>> {
		return this.getToken().mapErr(
			(error) =>
				new GHTokenRetrievalError(
					"No GitHub token found. Please run 'gh auth login'.",
					{
						cause: error,
					},
				),
		);
	}

	private getToken(): Result<string, Error> {
		try {
			const token = execSync("gh auth token", { encoding: "utf8" }).trim();
			return ok(token);
		} catch (error) {
			const e = error instanceof Error ? error : new Error(String(error));
			return err(e);
		}
	}
}
