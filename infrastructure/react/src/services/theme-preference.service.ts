import { ThemePreferenceService } from "../../../../application/usecases/theme-preference.service";
import { themeCatalogService } from "./theme-catalog.service";
import { createSimpleStorage } from "../utils/init-file-storage.utils";

export const themePreferenceService = new ThemePreferenceService({
	storage: createSimpleStorage("pyrogit", "config", "theme.json"),
	themeCatalog: themeCatalogService,
});
