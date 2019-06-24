import { KlasaClient } from 'klasa'

KlasaClient.defaultGuildSchema
	.add('followers', 'user', { array: true })
	.add('channels', channelFolder => channelFolder
		.add('wall', 'textchannel')
		.add('notifications', 'textchannel')
		.add('feed', 'textchannel')
		.add('photos', 'textchannel')
	)
	.add('roles', roleFolder => roleFolder
		.add('subscriber', 'role')
	)
