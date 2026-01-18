import { err, ok, type Result } from "neverthrow";
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

	async init(): Promise<
		Result<ChangeRequestService, GHTokenRetrievalError | Error>
	> {
		try {
			const tokenResult = await this.ghauth.getValidToken();
			if (tokenResult.isErr()) {
				return err(tokenResult.error);
			}

			const token = tokenResult.value;
			this._pyro = await init(token);
			await this._pyro.checkAuth();

			return ok(this._pyro);
		} catch (error: unknown) {
			let e = new Error("Unspecified Error");
			if (!(error instanceof Error)) e = new Error(String(error));

			return err(error instanceof Error ? error : e);
		}
	}
}
