import { ChangeRequestCacheService } from "../../../../application/usecases/change-request-cache.service";
import { RootLocator } from "../../../services/locator/locators";
import { createSimpleStorage } from "../utils/init-file-storage.utils";

function getProjectCacheFileName(): string {
	const projectPathResult = new RootLocator().findDir();
	if (projectPathResult.isErr()) return "unknown-prs.enc";

	const parts = projectPathResult.value.split("/");
	const projectName = parts[parts.length - 1] ?? "unknown";
	return `${projectName}-prs.enc`;
}

export const changeRequestCacheService = new ChangeRequestCacheService({
	storage: createSimpleStorage("pyrogit", "cache", getProjectCacheFileName()),
});
