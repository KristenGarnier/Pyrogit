import { TaggedError } from "./TaggedError";
export const GH_TOKEN_ERROR = Symbol("GH_TOKEN_ERROR");

export class GHTokenRetrievalError extends TaggedError {
	constructor(...args: ConstructorParameters<typeof Error>) {
		super(...args);
		this._tag = GH_TOKEN_ERROR;
	}
}
