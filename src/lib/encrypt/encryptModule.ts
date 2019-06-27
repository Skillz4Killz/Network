import { createCipher, createDecipher } from 'crypto';


export default class Encrypt {

	protected algo: string;
	private key: string;

	public constructor(key: string) {
		this.key = key;
		this.algo = 'aes-192-ctr';
	}

	public encrypt(text: string) {
		const cipher = createCipher(this.algo, this.key);
		cipher.update(text, 'utf8', 'base64');
		return cipher.final('base64');
	}

	public decrypt(text: string) {
		const cipher = createDecipher(this.algo, this.key);
		cipher.update(text, 'base64', 'utf8');
		return cipher.final('utf8');
	}

}
