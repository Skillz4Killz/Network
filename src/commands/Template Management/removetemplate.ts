import { Command, CommandStore, KlasaMessage, Permissions } from '../../imports';
import { ClientSettings } from '../../lib/types/settings/ClientSettings';

export default class extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['rt', 'rtemplate'],
			permissionLevel: 7,
			description: 'Removes a template from our database',
			usage: "<templateName:string>"
		})
	};
	
    async run(message: KlasaMessage, [templateName]: [string]) {

		// Find the template we want to delete
		const templates = this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;
		const relevantTemplate = templates.find(t => t.name.toLowerCase() === templateName.toLowerCase());
		if(!relevantTemplate) return message.sendMessage("I couldn't find that template! Please check your spelling if you are ***sure*** that template exists");
		const templateGuild = this.client.guilds.get(relevantTemplate.id);
		// Getting our member and checking his permission (MANAGE_GUILD is required in the template server to delete it);
		const memberStore = await templateGuild.members.fetch()
		const member = memberStore.get(message.author.id);
		if (!member) return message.sendMessage("Are you sure you are a member on this template server? In order to remove a template, you have to have Manager Server permissions on the template server.")
		if(!member.hasPermission(Permissions.FLAGS.MANAGE_GUILD)) return message.sendMessage("You don't seem to have enough permissions to do that! Only members of the template server with the `MANAGE SERVER` permission are allowed to delete templates");
		// Finally, delete the template
		const newTemplates = templates.filter(t => t.name !== templateName.toLowerCase());
		await this.client.settings.update(ClientSettings.GuildTemplates, newTemplates, { arrayAction: 'overwrite', throwOnError: true });
		return message.sendMessage('Template Deleted!');
	}

}
