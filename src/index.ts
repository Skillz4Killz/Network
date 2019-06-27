import { KlasaClient } from './imports';
import configs from '../configs';

import './lib/schemas/client';
import './lib/schemas/guild';
import './lib/schemas/user';

new KlasaClient({
	commandEditing: true,
	owners: ['130136895395987456'],
	prefix: '.',
	providers: {
		'default': 'postgresql',
		'postgresql': configs.postgresql
	},
	typing: true,
	readyMessage: client => `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`
}).login(configs.botToken);
