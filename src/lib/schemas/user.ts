import { KlasaClient } from 'klasa'

KlasaClient.defaultUserSchema
	.add('following', 'user', { array: true })
	.add('profile', profileFolder => profileFolder
		.add('serverID', 'guild')
		.add('language', 'string', { default: 'english' })
	)
