import { TaggedError } from "./TaggedError";
export const GH_PULL_ERROR = Symbol("GH_PULL_ERROR");

export class GHPullError extends TaggedError {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this._tag = GH_PULL_ERROR;
	}
}
