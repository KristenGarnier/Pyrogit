import { mkdir } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export const AppDirUsage = {
	CONFIG: "config",
	CACHE: "cache",
	DATA: "data",
	LOGS: "logs",
} as const;

export type AppDirUsage = (typeof AppDirUsage)[keyof typeof AppDirUsage];

export class AppDirectories {
	constructor(private readonly appName: string) {}

	public getPath(usage: AppDirUsage, createIfMissing = true): string {
		const baseDir = this.getBaseDir(usage);
		const fullPath = path.join(baseDir, this.appName);

		if (createIfMissing) {
			mkdir(fullPath, () => {});
		}

		return fullPath;
	}

	private getBaseDir(usage: AppDirUsage): string {
		const platform = process.platform;

		switch (platform) {
			case "win32":
				return this.getWindowsDir(usage);
			case "darwin":
				return this.getMacDir(usage);
			default:
				return this.getLinuxDir(usage);
		}
	}

	// ---------- OS specific ----------

	private getWindowsDir(usage: AppDirUsage): string {
		switch (usage) {
			case "config":
			case "data":
				return (
					process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming")
				);

			case "cache":
				return (
					process.env.LOCALAPPDATA ??
					path.join(os.homedir(), "AppData", "Local")
				);

			case "logs":
				return (
					process.env.LOCALAPPDATA ??
					path.join(os.homedir(), "AppData", "Local")
				);
		}
	}

	private getMacDir(usage: AppDirUsage): string {
		switch (usage) {
			case "config":
				return path.join(os.homedir(), ".config");

			case "data":
				return path.join(os.homedir(), "Library", "Application Support");

			case "cache":
				return path.join(os.homedir(), "Library", "Caches");

			case "logs":
				return path.join(os.homedir(), "Library", "Logs");
		}
	}

	private getLinuxDir(usage: AppDirUsage): string {
		switch (usage) {
			case "config":
				return (
					process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config")
				);

			case "data":
				return (
					process.env.XDG_DATA_HOME ??
					path.join(os.homedir(), ".local", "share")
				);

			case "cache":
				return process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache");

			case "logs":
				return path.join(
					process.env.XDG_STATE_HOME ??
						path.join(os.homedir(), ".local", "state"),
					"logs",
				);
		}
	}
}
