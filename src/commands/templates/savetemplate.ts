/*
[x]Use a customizeResponse to give a nice clean response when a Guild ID is not provided.
[]Make sure to check if the guild id already exists and return a message saying this already exists
[]ADD a guild id to the guild templates in the author.settings
[]Finally, test command
*/

import {  Command, CommandStore, KlasaMessage } from '../../imports'

export default class extends Command {
    constructor(store: CommandStore, file: string[], dir: string) {
        super(store, file, dir, {
            runIn: ['text'],
			aliases: ['savetemp'],
			permissionLevel: 7,
			requiredPermissions: ['MANAGE_CHANNELS'],
			description: 'Saves the template',
			usage: '<id:guild>'
        })
    }

    async run(msg: KlasaMessage){

        if(msg.content === msg.guild.id) return msg.send('Please provide a guild id')

        let guild = this.client.guilds.get('id')
        if(!guild.id) return null

        msg.author.settings.update(guild)

        msg.send('Template saved')
    }
}