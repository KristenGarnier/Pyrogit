import { describe, expect, it } from "bun:test";
import { err, ok } from "neverthrow";
import type { ThemeCatalog } from "../application/ports/theme-catalog";
import { ThemePreferenceService } from "../application/usecases/theme-preference.service";
import type { Storage } from "../infrastructure/services/storage/storage.interface";

class InMemoryStorage implements Storage<string> {
	constructor(private content: string | null = null) {}

	async read() {
		if (this.content === null) return err(new Error("not found"));
		return ok(this.content);
	}

	async write(content: string) {
		this.content = content;
		return ok(true);
	}
}

type MockTheme = {
	name: string;
	foreground: string;
};

const themeCatalog: ThemeCatalog<MockTheme> = {
	getDefault() {
		return {
			name: "catppuccin-mocha",
			theme: { name: "catppuccin-mocha", foreground: "#ffffff" },
		};
	},
	resolveByName(name: string) {
		if (name === "tokyo-night") {
			return {
				name,
				theme: { name, foreground: "#00ffff" },
			};
		}

		if (name === "gruvbox-dark") {
			return {
				name,
				theme: { name, foreground: "#fabd2f" },
			};
		}

		if (name === "dracula") {
			return {
				name,
				theme: { name, foreground: "#bd93f9" },
			};
		}

		return this.getDefault();
	},
	getAvailableNames() {
		return ["catppuccin-mocha", "tokyo-night", "gruvbox-dark", "dracula"];
	},
};

describe("ThemePreferenceService", () => {
	it("hydrates from flat payload", async () => {
		const storage = new InMemoryStorage(JSON.stringify({ themeName: "tokyo-night" }));
		const service = new ThemePreferenceService({
			storage,
			themeCatalog,
		});

		const result = await service.hydrate();

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap().name).toBe("tokyo-night");
	});

	it("hydrates from legacy zustand payload", async () => {
		const storage = new InMemoryStorage(
			JSON.stringify({ state: { themeName: "gruvbox-dark" } }),
		);
		const service = new ThemePreferenceService({
			storage,
			themeCatalog,
		});

		const result = await service.hydrate();

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap().name).toBe("gruvbox-dark");
	});

	it("uses default theme when storage is empty", async () => {
		const service = new ThemePreferenceService({
			storage: new InMemoryStorage(),
			themeCatalog,
		});

		const result = await service.hydrate();

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap().name).toBe("catppuccin-mocha");
	});

	it("persists selected theme", async () => {
		const storage = new InMemoryStorage();
		const service = new ThemePreferenceService({
			storage,
			themeCatalog,
		});

		const writeResult = await service.setThemeName("dracula");

		expect(writeResult.isOk()).toBe(true);
		expect(service.get()._unsafeUnwrap().name).toBe("dracula");
	});

	it("returns available themes from catalog", () => {
		const service = new ThemePreferenceService({
			storage: new InMemoryStorage(),
			themeCatalog,
		});

		const result = service.getAvailableThemes();

		expect(result.isOk()).toBe(true);
		expect(result._unsafeUnwrap()).toContain("tokyo-night");
	});
});
