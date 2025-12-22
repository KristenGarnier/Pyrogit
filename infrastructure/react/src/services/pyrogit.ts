import path from "node:path";
import type { ChangeRequestService } from "../../../../application/usecases/change-request.service";
import { init } from "../../../app/app";
import { EncryptedStorage } from "../../../services/storage/decorators/encryption.decorator.storage";
import { FileStorage } from "../../../services/storage/file.storage";
import { EncryptionKeyManager } from "../../../services/storage/key-manager.storage";
import {
	AppDirectories,
	AppDirUsage,
} from "../../../services/storage/locator.storage";
import type { Storage } from "../../../services/storage/storage.interface";

export type ErrorValue<T> =
	| [error: Error, result: null]
	| [error: null, result: T];

export class Pyrogit {
	private _pyro: ChangeRequestService | null = null;
	private _isInit: boolean = false;
	private storage: Storage<string>;

	constructor() {
		const keyManager = new EncryptionKeyManager();
		const directory = new AppDirectories("pyrogit");
		this.storage = new EncryptedStorage(
			new FileStorage(
				path.join(directory.getPath(AppDirUsage.DATA), "auth.enc"),
			),
			keyManager,
		);
	}

	get pyro(): ErrorValue<ChangeRequestService> {
		if (!this._pyro) return [new Error("Pyro not yet initialized"), null];
		return [null, this._pyro];
	}

	get isInit(): ErrorValue<typeof this._isInit> {
		return [null, this._isInit];
	}

	async init(token?: string): Promise<ErrorValue<typeof this._pyro>> {
		try {
			if (!token && !(await this.checkTokenFromStorage())) {
				return [new Error("No token available"), null];
			}

			this._pyro = init(token ?? (await this.retrieveTokenFromStorage()));
			await this._pyro.checkAuth();

			if (token) void this.storage.write(token);

			return [null, this._pyro];
		} catch (error: unknown) {
			let err = new Error("Unspecified Error");
			if (!(error instanceof Error)) err = new Error(String(error));

			return [error instanceof Error ? error : err, null];
		}
	}

	private async retrieveTokenFromStorage(): Promise<string> {
		const [error, token] = await this.storage.read();
		if (error) throw error;
		if (!token || token === "")
			throw new Error("Token is null or empty in the storage");

		return token;
	}

	private async checkTokenFromStorage(): Promise<boolean> {
		const [error, token] = await this.storage.read();
		if (!token || error || token === "") {
			return false;
		}

		return true;
	}
}
