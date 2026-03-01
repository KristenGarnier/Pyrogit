import path from "node:path";
import { FileStorage } from "../../../services/storage/file.storage";
import { AppDirectories, type AppDirUsage } from "../../../services/storage/locator.storage";

export function createSimpleStorage(directoryName: string, usage: AppDirUsage, fileName: string) {
  const directory = new AppDirectories(directoryName);
  const storage = new FileStorage(path.join(directory.getPath(usage), fileName));

  return storage;
}
