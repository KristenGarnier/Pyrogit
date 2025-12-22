import type { FileStorage } from "../../../services/storage/file.storage";

export function zustandFileStorage(storage: FileStorage) {
	return () => ({
		async getItem(_name: string) {
			const [error, prs] = await storage.read();
			if (error || !prs) return "{}";

			return prs;
		},
		async setItem(_name: string, value: string) {
			await storage.write(value);
		},
		async removeItem(_name: string) {
			await storage.write("");
		},
	});
}
