import { TaggedError } from "./TaggedError";
export const GH_PULL_REVIEWS_ERROR = Symbol("GH_PULL_REVIEWS_ERROR");

export class GHPullReviewsError extends TaggedError {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this._tag = GH_PULL_REVIEWS_ERROR;
	}
}
