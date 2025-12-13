import * as crypto from "node:crypto";
import type { Storage } from "../storage.interface";
import type { EncryptionKeyManager } from "../key-manager.storage";
import type { ErrorValue } from "../../../react/src/services/pyrogit";

type Payload = {
	key: string; // encrypted AES key (base64)
	iv: string;
	tag: string;
	data: string;
};

export class EncryptedStorage implements Storage<string> {
	constructor(
		private readonly storage: Storage<string>,
		private readonly keyManager: EncryptionKeyManager,
	) {
		keyManager.init();
	}

	async write(content: string): Promise<ErrorValue<boolean>> {
		try {
			const aesKey = crypto.randomBytes(32);
			const iv = crypto.randomBytes(12);

			const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
			const encrypted = Buffer.concat([
				cipher.update(content, "utf8"),
				cipher.final(),
			]);

			const payload: Payload = {
				key: this.keyManager.encryptKey(aesKey).toString("base64"),
				iv: iv.toString("base64"),
				tag: cipher.getAuthTag().toString("base64"),
				data: encrypted.toString("base64"),
			};

			return await this.storage.write(JSON.stringify(payload));
		} catch (e) {
			return [false, e instanceof Error ? e : new Error(String(e))];
		}
	}

	async read(): Promise<ErrorValue<string>> {
		const [raw, err] = await this.storage.read();
		if (err || !raw) return [null, err ?? new Error("Empty storage")];

		try {
			const payload = JSON.parse(raw) as Payload;

			const aesKey = this.keyManager.decryptKey(
				Buffer.from(payload.key, "base64"),
			);

			const decipher = crypto.createDecipheriv(
				"aes-256-gcm",
				aesKey,
				Buffer.from(payload.iv, "base64"),
			);

			decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

			const decrypted = Buffer.concat([
				decipher.update(Buffer.from(payload.data, "base64")),
				decipher.final(),
			]);

			return [decrypted.toString("utf8"), null];
		} catch (e) {
			return [null, e instanceof Error ? e : new Error(String(e))];
		}
	}
}
