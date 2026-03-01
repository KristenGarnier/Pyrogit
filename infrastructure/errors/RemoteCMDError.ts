import { TaggedError } from "./TaggedError";
export const REMOTE_CMD_ERROR = Symbol("REMOTE_CMD_ERROR");

export class RemoteCMDError extends TaggedError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this._tag = REMOTE_CMD_ERROR;
  }
}
