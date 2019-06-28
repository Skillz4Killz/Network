import { KlasaClient } from './imports';
import configs from '../configs';

import './lib/schemas/client';
import './lib/schemas/guild';
import './lib/schemas/user';

new KlasaClient({
	commandEditing: true,
	owners: configs.owners,
	prefix: '.',
	providers: {
		'default': 'mongodb',
		'mongodb': configs.mongodb
	},
	readyMessage: client => `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`,
	typing: true
}).login(configs.botToken);
