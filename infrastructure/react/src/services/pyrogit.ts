import { err, ok, ResultAsync, type Result } from "neverthrow";
import type { ChangeRequestService } from "../../../../application/usecases/change-request.service";
import { init } from "../../../app/app";
import type { GHTokenRetrievalError } from "../../../errors/GHTokenRetrievalError";
import { GhAuthService } from "../../../services/ghauth.service";

export class Pyrogit {
  private _pyro: ChangeRequestService | null = null;
  private _isInit: boolean = false;
  private ghauth: GhAuthService;

  constructor() {
    this.ghauth = new GhAuthService();
  }

  get pyro(): Result<ChangeRequestService, Error> {
    if (!this._pyro) return err(new Error("Pyro not yet initialized"));
    return ok(this._pyro);
  }

  get isInit(): Result<boolean, Error> {
    return ok(this._isInit);
  }

	async init(): Promise<Result<ChangeRequestService, GHTokenRetrievalError | Error>> {
		const tokenResult = await this.ghauth.getValidToken();
		if (tokenResult.isErr()) return err(tokenResult.error);

		const initResult = await ResultAsync.fromPromise(
			init(tokenResult.value),
			(error) => (error instanceof Error ? error : new Error(String(error))),
		);
		if (initResult.isErr()) return err(initResult.error);

		const service = initResult.value;
		const authResult = await ResultAsync.fromPromise(
			service.checkAuth(),
			(error) => (error instanceof Error ? error : new Error(String(error))),
		);
		if (authResult.isErr()) return err(authResult.error);

		this._pyro = service;
		return ok(service);
	}
}
