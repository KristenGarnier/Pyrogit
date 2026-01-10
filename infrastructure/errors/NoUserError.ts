import { TaggedError } from "./TaggedError";
export const NO_USER_ERROR = Symbol("NO_USER_ERROR");

export class NoUserError extends TaggedError {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this._tag = NO_USER_ERROR;
	}
}
