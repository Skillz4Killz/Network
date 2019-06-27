import { createCipher, createDecipher } from 'crypto';
import config from '../../../configs';

const algorithm = 'aes-192-ctr';

// eslint-disable-next-line
export default class Encrypt {

	public static encrypt(text: string) {
		const cipher = createCipher(algorithm, config.encryptPassword);
		cipher.update(text, 'utf8', 'base64');
		return cipher.final('base64');
	}

	public static decrypt(text: string) {
		const cipher = createDecipher(algorithm, config.encryptPassword);
		cipher.update(text, 'base64', 'utf8');
		return cipher.final('utf8');
	}

}
