import { execSync } from "node:child_process";
import { Result, type Result as ResultType } from "neverthrow";
import { GHTokenRetrievalError } from "../errors/GHTokenRetrievalError";

	export class GhAuthService {
	async getValidToken(): Promise<ResultType<string, GHTokenRetrievalError>> {
		return this.getToken().mapErr(
			(error) =>
				new GHTokenRetrievalError("No GitHub token found. Please run 'gh auth login'.", {
					cause: error,
				}),
		);
	}

	private getToken(): ResultType<string, Error> {
		return Result.fromThrowable(
			() => execSync("gh auth token", { encoding: "utf8" }).trim(),
			(error) => (error instanceof Error ? error : new Error(String(error))),
		)();
	}
}
