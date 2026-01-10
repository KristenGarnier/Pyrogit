import { TaggedError } from "./TaggedError";
export const GH_PULL_LIST_ERROR = Symbol("GH_PULL_LIST_ERROR");

export class GHPullListError extends TaggedError {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this._tag = GH_PULL_LIST_ERROR;
	}
}
