import { Command, klasaVersion, Duration, discordJSVersion, MessageEmbed, CommandStore, KlasaMessage } from '../../imports';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_STATS_DESCRIPTION')
		});
	}

	public async run(message: KlasaMessage) {
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

		return message.send(new MessageEmbed()
			.setAuthor('Bot Statistics', this.client.user.displayAvatarURL())
			.setColor('RANDOM')
			.addField('Memory Usage', (memory || process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), true)
			.addField('Uptime', Duration.toNow(Date.now() - (process.uptime() * 1000)), true)
			.addField('Users', (users || this.client.users.size).toLocaleString(), true)
			.addField('Guilds', (guilds || this.client.guilds.size).toLocaleString(), true)
			.addField('Channels', (channels || this.client.channels.size).toLocaleString(), true)
			.addField('Klasa', `v${klasaVersion}`, true)
			.addField('Discord.JS', `v${discordJSVersion}`, true)
			.addField('Node.js', process.version, true)
			.addField('Shard', `${(message.guild ? message.guild.shardID : 0) + 1} / ${this.client.options.totalShardCount}`, true));
	}

}
