import * as crypto from "node:crypto";
import keytar from "keytar";

const SERVICE = "pyrogit";
const ACCOUNT = "encryption-key";

export class EncryptionKeyManager {
	private publicKey!: crypto.KeyObject;
	private privateKey!: crypto.KeyObject;

	async init(): Promise<void> {
		const stored = await keytar.getPassword(SERVICE, ACCOUNT);

		if (stored) {
			const { publicKey, privateKey } = JSON.parse(stored);
			this.publicKey = crypto.createPublicKey(publicKey);
			this.privateKey = crypto.createPrivateKey(privateKey);
			return;
		}

		const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
			modulusLength: 4096,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});

		await keytar.setPassword(
			SERVICE,
			ACCOUNT,
			JSON.stringify({ publicKey, privateKey }),
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
}
