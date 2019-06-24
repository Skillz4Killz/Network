import { KlasaClient } from './imports'
import configs from '../configs'

new KlasaClient({
	commandEditing: true,
	prefix: '.',
	typing: true,
	readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`,
	providers: {
		default: 'postgresql',
		postgresql: configs.postgresql
	},
}).login(configs.botToken);
