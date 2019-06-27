import { KlasaClient } from 'klasa';

KlasaClient.defaultClientSchema
	.add('guildTemplates', 'guild', { array: true });
