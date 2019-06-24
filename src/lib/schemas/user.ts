import { KlasaClient } from 'klasa'

KlasaClient.userSchema
	.add('following', 'user', { array: true })
	.add('profile', profileFolder => profileFolder
		.add('serverID', 'guild')
		.add('language', 'string', { default: 'english' })
	)
