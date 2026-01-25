import { TaggedError } from "./TaggedError";
export const LOCATOR_NO_PARENT_ERROR = Symbol("LOCATOR_NO_PARENT_ERROR");
export const LOCATOR_ACCESS_ERROR = Symbol("LOCATOR_NO_ACCESS_ERROR");

export class LocatorNoParentError extends TaggedError {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this._tag = LOCATOR_NO_PARENT_ERROR;
	}
}

export class LocatorAccessError extends TaggedError {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this._tag = LOCATOR_ACCESS_ERROR;
	}
}
