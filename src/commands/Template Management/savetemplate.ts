import { Command, CommandStore, KlasaMessage } from '../../imports';
import { ClientSettings } from '../../lib/types/settings/ClientSettings';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['savetemp'],
			permissionLevel: 7,
			description: 'Saves this server as a template, so you can create another server with the same format.',
			usage: '<templateName:string>'
		});

		this.customizeResponse('templateName', 'You did not provide a template name. Please try the command again and give a name you wish to save the template as.');
	}

	public async run(message: KlasaMessage, [templateName]: [any]) {
		const templates = this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;

		const template = templates.find(temp => temp.id === message.guild.id);

		if (template) return message.send(`This template already exists under the name of ${template.name}`);

		await this.client.settings.update(ClientSettings.GuildTemplates, { name: templateName, id: message.guild.id });

		return message.send(`The template has been saved with the name **${templateName}**. You can now add the bot to new server and type **.createserver ${templateName}** to create a copy of the server.`);
	}

}
