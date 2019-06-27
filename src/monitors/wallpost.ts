import { KlasaMessage, Monitor, MonitorStore } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { TextChannel, MessageEmbed, Message } from 'discord.js';

export default class extends Monitor {

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false
		});
	}

	public async run(message: KlasaMessage) {
		// If the user doesnt have permissions to add reactions
		if (!(message.channel as TextChannel).permissionsFor(message.guild.me).has('ADD_REACTIONS')) return null;

		// If the guild doesnt have a wall channel or if this is NOT the wall channel cancel it
		const wallChannelID = message.guild.settings.get(GuildSettings.Channels.WallID) as GuildSettings.Channels.TextChannelID;
		if (!wallChannelID || (wallChannelID !== message.channel.id)) return null;

		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setColor('RANDOM')
			.setDescription(message.content)
			.setImage(message.attachments.size ? message.attachments.first().url : null)
			.setTimestamp()
			.setFooter(message.author.id);

		try {
			// Resend the message as an embed
			const posted = await message.send(embed) as Message;
			// Add the reactions to the message
			for (const reaction of ['❤', '🔁', '➕']) await posted.react(reaction);

			// Delete the original message the author posted to keep channel clean
			if (message.deletable && !message.deleted) await message.delete();

			return posted;
		} catch (error) {
			// Silently error cause monitors are way too risky to send messages
			return this.client.emit('error', error);
		}
	}

}
