import { TaggedError } from "./TaggedError";
export const REMOTE_NO_RESULT_ERROR = Symbol("REMOTE_NO_RESULT_ERROR");

export class RemoteNoResultError extends TaggedError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this._tag = REMOTE_NO_RESULT_ERROR;
  }
}
