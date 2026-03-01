import type { FileStorage } from "../../../services/storage/file.storage";

export function zustandFileStorage(storage: FileStorage) {
  return () => ({
    async getItem(_name: string) {
      const readResult = await storage.read();
      if (readResult.isErr() || !readResult.value) return "{}";

      return readResult.value;
    },
    async setItem(_name: string, value: string) {
      await storage.write(value);
    },
    async removeItem(_name: string) {
      await storage.write("");
    },
  });
}
