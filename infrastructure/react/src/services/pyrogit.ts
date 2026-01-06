import type { ChangeRequestService } from "../../../../application/usecases/change-request.service";
import { init } from "../../../app/app";
import { GhAuthService } from "../../../services/ghauth.service";

export type ErrorValue<T> =
	| [error: Error, result: null]
	| [error: null, result: T];

export class Pyrogit {
	private _pyro: ChangeRequestService | null = null;
	private _isInit: boolean = false;
	private ghauth: GhAuthService;

	constructor() {
		this.ghauth = new GhAuthService();
	}

	get pyro(): ErrorValue<ChangeRequestService> {
		if (!this._pyro) return [new Error("Pyro not yet initialized"), null];
		return [null, this._pyro];
	}

	get isInit(): ErrorValue<typeof this._isInit> {
		return [null, this._isInit];
	}

	async init(): Promise<ErrorValue<typeof this._pyro>> {
		try {
			const [error, token] = await this.ghauth.getValidToken();
			if (error) {
				return [error, null];
			}

			this._pyro = init(token!);
			await this._pyro.checkAuth();

			return [null, this._pyro];
		} catch (error: unknown) {
			let err = new Error("Unspecified Error");
			if (!(error instanceof Error)) err = new Error(String(error));

			return [error instanceof Error ? error : err, null];
		}
	}
}
