import { Command, CommandStore, KlasaMessage, Permissions } from "../../imports";
import { ClientSettings } from "../../lib/types/settings/ClientSettings";

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
	
    async run(message: KlasaMessage, [templateName]: [string]): Promise<KlasaMessage> {
		const templates = this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;
		const relevantTemplate = templates.find(t => t.name.toLowerCase() === templateName.toLowerCase());
		if(!relevantTemplate) return message.channel.send("I couldn't find that template! Please check your spelling if you are ***sure*** that template exists") as any;
		const templateGuild = this.client.guilds.get(relevantTemplates[0].id);
		await templateGuild.members.fetch()
		if(!templateGuild.members.get(message.author.id).hasPermission(Permissions.FLAGS.MANAGE_GUILD))	return message.channel.send("You don't seem to have enough permissions to do that! Only members of the template server with the `MANAGE SERVER` permission are allowed to delete templates") as any;
		const newTemplates = templates.filter(t => t.name.toLowerCase() !== templateName.toLowerCase());
		this.client.settings.update(ClientSettings.GuildTemplates, newTemplates, { arrayAction: "overwrite", throwOnError: true });
		return message.channel.send("Template Deleted!") as any;
	};
};
