import { Command, CommandStore, KlasaMessage } from '../../imports';
import { ClientSettings } from '../../lib/types/settings/ClientSettings';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['savetemp'],
			permissionLevel: 7,
			description: 'Saves this server as a template, so you can create another server with the same format.'
		});
	}

	public async run(message: KlasaMessage) {
		const templates = this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;

		const template = templates.includes(message.guild.id);

		if (template) return message.send(`This server has already been added as a template.`);

		await this.client.settings.update(ClientSettings.GuildTemplates, message.guild.id, { throwOnError: true });

		return message.send(`The template has been saved. You can now add the bot to a new server and type **.createserver ${message.guild.id}** to create a copy of the server.`);
	}

}
