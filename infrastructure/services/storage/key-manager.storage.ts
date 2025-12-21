import * as crypto from "node:crypto";
import keytar from "keytar";

const SERVICE = "pyrogit";
const ACCOUNT = "encryption-key";

export class EncryptionKeyManager {
	private publicKey!: crypto.KeyObject;
	private privateKey!: crypto.KeyObject;
	private hmacKey!: Buffer;
	private initPromise: Promise<void> | null = null;

	init(): Promise<void> {
		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = this.initInternal();
		return this.initPromise;
	}

	private async initInternal(): Promise<void> {
		try {
			const stored = await keytar.getPassword(SERVICE, ACCOUNT);

			if (stored) {
				await this.loadKeys(stored);
			} else {
				await this.generateKeys();
			}
		} catch (e) {
			this.initPromise = null;
			throw new Error(`Key initialization failed: ${e}`);
		}
	}

	private async loadKeys(stored: string): Promise<void> {
		try {
			const parsed = JSON.parse(stored);

			if (!parsed.hmacKey) {
				parsed.hmacKey = crypto.randomBytes(32).toString("base64");
				await keytar.setPassword(SERVICE, ACCOUNT, JSON.stringify(parsed));
			}

			this.publicKey = crypto.createPublicKey(parsed.publicKey);
			this.privateKey = crypto.createPrivateKey(parsed.privateKey);
			this.hmacKey = Buffer.from(parsed.hmacKey, "base64");
		} catch (_) {
			throw new Error("Corrupted key storage detected");
		}
	}

	private async generateKeys(): Promise<void> {
		const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
			modulusLength: 4096,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});

		this.hmacKey = crypto.randomBytes(32);

		await keytar.setPassword(
			SERVICE,
			ACCOUNT,
			JSON.stringify({
				publicKey,
				privateKey,
				hmacKey: this.hmacKey.toString("base64"),
			}),
		);

		this.publicKey = crypto.createPublicKey(publicKey);
		this.privateKey = crypto.createPrivateKey(privateKey);
	}

	encryptKey(key: Buffer): Buffer {
		return crypto.publicEncrypt(
			{
				key: this.publicKey,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: "sha256",
			},
			key,
		);
	}

	decryptKey(encryptedKey: Buffer): Buffer {
		return crypto.privateDecrypt(
			{
				key: this.privateKey,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: "sha256",
			},
			encryptedKey,
		);
	}

	computeIntegrity(data: string): string {
		const hmac = crypto.createHmac("sha256", this.hmacKey);
		hmac.update(data);
		return hmac.digest("base64");
	}

	verifyIntegrity(data: string, expectedIntegrity: string): boolean {
		const computed = this.computeIntegrity(data);
		const expected = Buffer.from(expectedIntegrity, "base64");
		const computedBuffer = Buffer.from(computed, "base64");

		if (expected.length !== computedBuffer.length) {
			return false;
		}

		return crypto.timingSafeEqual(expected, computedBuffer);
	}
}
