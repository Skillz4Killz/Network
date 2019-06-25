/*
[x]Use a customizeResponse to give a nice clean response when a Guild ID is not provided.
[]Make sure to check if the guild id already exists and return a message saying this already exists
[]ADD a guild id to the guild templates in the author.settings
[]Finally, test command
*/

import {  Command, CommandStore, KlasaMessage , KlasaGuild} from '../../imports'
import { ClientSettings } from '../../lib/types/settings/ClientSettings';

export default class extends Command {
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            runIn: ['text'],
			aliases: ['savetemp'],
			permissionLevel: 4,
			description: 'Saves the template',
			usage: '<templateName:string>'
        })
    }
  //KlasaGuild isnt reading from Iimports
    async run(message: KlasaMessage, [guild: KlasaGuild]){

      await this.client.settings.update(ClientSettings.GuildTemplates, { name: 'templateName', id: message.guild.id })

       message.send('Template saved')
    }
}