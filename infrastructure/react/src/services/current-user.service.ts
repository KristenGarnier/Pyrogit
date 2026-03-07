import path from "node:path";
import { CurrentUserService } from "../../../../application/usecases/current-user.service";
import { FileStorage } from "../../../services/storage/file.storage";
import { AppDirectories } from "../../../services/storage/locator.storage";

const directory = new AppDirectories("pyrogit");
const storage = new FileStorage(path.join(directory.getPath("cache"), "user.enc"));

export const currentUserService = new CurrentUserService({
	storage,
});
