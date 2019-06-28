import { KlasaMessage, Monitor, MonitorStore } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { TextChannel, MessageEmbed, Message, User } from 'discord.js';
import { UserSettings } from '../lib/types/settings/UserSettings';

export default class extends Monitor {

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false
		});
	}

	public async run(message: KlasaMessage) {
		// If the user doesnt have permissions to add reactions
		if (!(message.channel as TextChannel).permissionsFor(message.guild.me).has('ADD_REACTIONS')) return null;

		// Only owners can post
		if (message.guild.ownerID !== message.author.id) return null;

		// If the guild doesnt have a wall channel or if this is NOT the wall channel cancel it
		const [wallChannelID, photosChannelID] = message.guild.settings.pluck(GuildSettings.Channels.WallID, GuildSettings.Channels.PhotosID);
		if (!wallChannelID || (wallChannelID !== message.channel.id)) return null;

		const imageURL = message.attachments.size ? message.attachments.first().url : null;

		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setColor('RANDOM')
			.setDescription(message.content)
			.setImage(imageURL)
			.setTimestamp()
			.setFooter(message.author.id);

		try {
			// Resend the message as an embed
			const posted = await message.send(embed) as Message;
			// Add the reactions to the message
			for (const reaction of ['❤', '🔁', '➕']) await posted.react(reaction);

			// Delete the original message the author posted to keep channel clean
			if (message.deletable && !message.deleted) await message.delete();

			// If there was no image then simple cancel out
			if (!imageURL || !photosChannelID) return posted;

			// If an image was attached post the image in #photos
			const photosChannel = message.guild.channels.get(photosChannelID) as TextChannel;
			if (!photosChannel) return posted;

			await photosChannel.send(embed);

			// Now we have to repost this in every followers feed
			for (const user of this.client.users.values()) {
				const [followers, serverID] = user.settings.pluck(UserSettings.Following, UserSettings.Profile.ServerID);
				// If this user is not following then skip
				if (!followers.includes(message.author.id)) continue;

				// This user is following so get the profile server for this user
				const guild = this.client.guilds.get(serverID);
				if (!guild) return null;

				// Get the channel from the settings
				const [feedChannel] = await guild.settings.resolve(GuildSettings.Channels.FeedID);
				if (!feedChannel) return null;

				return feedChannel.send(embed);
			}
		} catch (error) {
			// Silently error cause monitors are way too risky to send messages
			return this.client.emit('error', error);
		}
	}

}
