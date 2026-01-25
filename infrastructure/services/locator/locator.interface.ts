import type { Result } from "neverthrow";
import type {
	LocatorAccessError,
	LocatorNoParentError,
} from "../../errors/LocatorError";

export interface Locator {
	findDir(): Result<string, LocatorAccessError | LocatorNoParentError>;
}
