import { Command, KlasaMessage, CommandStore, MessageEmbed } from '../../imports'
import { version: klasaVersion } from 'klasa'
import { discordVersion } from 'discord.js'
//import { version: discordv } from 'discord.js'

export default class extends Command {

	 constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['sts'],
			description: 'Shows server stats',
			extendedHelp: 'none'
		});
    }

     async run(message: KlasaMessage) {
        
        let [users, guilds, channels, memory] = [0, 0, 0, 0];

		if (this.client.shard) {
			const results = await this.client.shard.broadcastEval(`[this.users.size, this.guilds.size, this.channels.size, (process.memoryUsage().heapUsed / 1024 / 1024)]`);
			for (const result of results) {
				users += result[0];
				guilds += result[1];
				channels += result[2];
				memory += result[3];
			}
        }
        
        const statembed = new MessageEmbed()
        .addField('Users', this.client.users.size).toLocaleString()
        message.send(statembed)

    }
}