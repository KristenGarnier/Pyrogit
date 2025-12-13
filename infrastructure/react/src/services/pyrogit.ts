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
import path from "node:path";

export type ErrorValue<T> = [result: T | null, error: Error | null];

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
		if (!this._pyro) return [null, new Error("Pyro not yet initialized")];
		return [this._pyro, null];
	}

	get isInit(): ErrorValue<typeof this._isInit> {
		return [this._isInit, null];
	}

	async init(token?: string): Promise<ErrorValue<typeof this._pyro>> {
		try {
			if (!token && !(await this.checkTokenFromStorage())) {
				return [null, new Error("No token available")];
			}

			this._pyro = init(token ?? (await this.retrieveTokenFromStorage()));
			await this._pyro.checkAuth();

			if (token) void this.storage.write(token);

			return [this._pyro, null];
		} catch (error: unknown) {
			let err = new Error("Unspecified Error");
			if (!(error instanceof Error)) err = new Error(String(error));

			return [null, error instanceof Error ? error : err];
		}
	}

	private async retrieveTokenFromStorage(): Promise<string> {
		const [token, error] = await this.storage.read();
		if (error) throw error;
		if (!token || token === "")
			throw new Error("Token is null or empty in the storage");

		return token;
	}

	private async checkTokenFromStorage(): Promise<boolean> {
		const [token, error] = await this.storage.read();
		if (!token || error || token === "") {
			return false;
		}

		return true;
	}
}
