import * as crypto from "node:crypto";
import type { ErrorValue } from "../../../react/src/services/pyrogit";
import type { EncryptionKeyManager } from "../key-manager.storage";
import type { Storage } from "../storage.interface";

const TOKEN_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 jours

type Payload = {
	version: number;
	key: string;
	iv: string;
	tag: string;
	data: string;
	timestamp: number;
	integrity: string;
};

export class EncryptedStorage implements Storage<string> {
	private initPromise: Promise<void>;

	constructor(
		private readonly storage: Storage<string>,
		private readonly keyManager: EncryptionKeyManager,
	) {
		this.initPromise = keyManager.init();
	}

	async write(content: string): Promise<ErrorValue<boolean>> {
		await this.initPromise;

		try {
			const aesKey = crypto.randomBytes(32);
			const iv = crypto.randomBytes(12);

			const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
			const encrypted = Buffer.concat([
				cipher.update(content, "utf8"),
				cipher.final(),
			]);

			const payloadData = {
				version: 1,
				key: this.keyManager.encryptKey(aesKey).toString("base64"),
				iv: iv.toString("base64"),
				tag: cipher.getAuthTag().toString("base64"),
				data: encrypted.toString("base64"),
				timestamp: Date.now(),
			};

			const dataForIntegrity = JSON.stringify(payloadData);
			const integrity = this.keyManager.computeIntegrity(dataForIntegrity);

			const payload: Payload = {
				...payloadData,
				integrity,
			};

			aesKey.fill(0);

			const [error, result] = await this.storage.write(JSON.stringify(payload));
			return error ? [error, null] : [null, result];
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return [error, null];
		}
	}

	async read(): Promise<ErrorValue<string>> {
		await this.initPromise;

		const [err, raw] = await this.storage.read();
		if (err || !raw) {
			return [err ?? new Error("Empty storage"), null];
		}

		try {
			const payload = JSON.parse(raw) as Payload;

			if (payload.version !== 1) {
				return [new Error("Unsupported payload version"), null];
			}

			const { integrity, ...payloadWithoutIntegrity } = payload as Payload;
			const dataForIntegrity = JSON.stringify(payloadWithoutIntegrity);

			if (!this.keyManager.verifyIntegrity(dataForIntegrity, integrity)) {
				return [
					new Error("Payload integrity check failed - possible tampering"),
					null,
				];
			}

			const age = Date.now() - (payload.timestamp ?? 0);
			if (age > TOKEN_MAX_AGE_MS) {
				return [
					new Error(
						`Token expired (age: ${Math.floor(age / (24 * 60 * 60 * 1000))} days)`,
					),
					null,
				];
			}

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

			aesKey.fill(0);

			return [null, decrypted.toString("utf8")];
		} catch (e) {
			return [e instanceof Error ? e : new Error(String(e)), null];
		}
	}
}
