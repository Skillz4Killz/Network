import { KlasaClient } from 'klasa'

KlasaClient.userSchema
	.add('following', 'user', { array: true })
	.add('profile', profileFolder => profileFolder
		.add('language', 'string', { default: 'english' })
	)
