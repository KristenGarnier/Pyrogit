import { execSync } from "child_process";

type ErrorValue<T> = [error: Error | null, result: T | null];

export class GhAuthService {
	async login(): Promise<ErrorValue<string>> {
		try {
			const existingToken = await this.getTokenFromGh();
			if (existingToken) {
				return [null, existingToken];
			}

			console.log(
				"Please run 'gh auth login' in another terminal to authenticate with GitHub.",
			);
			console.log("Then come back and try again.");
			return [
				new Error("Please authenticate with 'gh auth login' first."),
				null,
			];
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			return [err, null];
		}
	}

	async getValidToken(): Promise<ErrorValue<string>> {
		try {
			const token = await this.getTokenFromGh();
			if (token) {
				return [null, token];
			}
			return [
				new Error("No GitHub token found. Please run 'gh auth login'."),
				null,
			];
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			return [err, null];
		}
	}

	private async getTokenFromGh(): Promise<string | null> {
		try {
			const token = execSync("gh auth token", { encoding: "utf8" }).trim();
			return token || null;
		} catch {
			return null;
		}
	}
}
