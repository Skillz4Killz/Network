import { Command, CommandStore, KlasaMessage, Permissions } from "../../imports";
import { ClientSettings } from "../../lib/types/settings/ClientSettings";

export default class extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['rt', 'rtemplate'],
			permissionLevel: 7,
			requiredPermissions: [],
			description: 'Removes a template from our database',
			usage: "<templateName:string>"
		})
	};
	
    async run(message: KlasaMessage, [templateName]: [string]): Promise<KlasaMessage> {
		const templates = this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;
		const relevantTemplates = templates.find(t => t.name.toLower)
				
	};
};