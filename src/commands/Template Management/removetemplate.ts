
import { Command, CommandStore, KlasaMessage, Permissions } from '../../imports';
import { ClientSettings } from '../../lib/types/settings/ClientSettings';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['rt', 'rtemplate'],
			permissionLevel: 7,
			description: 'Removes a template from our database'
		});
	}

	public async run(message: KlasaMessage) {
		// Find the template we want to delete
		const templates = this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;
		const isTemplate = templates.includes(message.guild.id);
		if (!isTemplate) return message.sendMessage(`This server does not exist as a template. Did you mean to use the **.savetemplate** command?`);

		if (!message.member.hasPermission(Permissions.FLAGS.MANAGE_GUILD)) return message.sendMessage(`You don't seem to have enough permissions to do that! Only members of the template server with the **MANAGE SERVER** permission are allowed to delete templates`);

		// Update the settings with the clean array of templates
		await this.client.settings.update(ClientSettings.GuildTemplates, message.guild.id, { throwOnError: true });

		return message.sendMessage('Template Deleted!');
	}

}
