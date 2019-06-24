import { KlasaClient } from 'klasa'

KlasaClient.defaultUserSchema
	.add('following', 'user', { array: true })
	.add('profile', profileFolder => profileFolder
		.add('language', 'string', { default: 'english' })
	)
