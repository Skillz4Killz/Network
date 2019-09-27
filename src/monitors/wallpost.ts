import { KlasaMessage, Monitor, MonitorStore } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { TextChannel, MessageEmbed, Message } from 'discord.js';
import { UserSettings } from '../lib/types/settings/UserSettings';

const postReactions = ['❤', '🔁', '➕'];
export default class extends Monitor {

	public constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			ignoreOthers: false
		});
	}

	public async run(message: KlasaMessage) {
		// If the message is not in a guild cancel out or the user doesnt have permissions to add reactions
		if (!message.guild || !(message.channel as TextChannel).permissionsFor(message.guild.me).has('ADD_REACTIONS')) return null;

		// Only owners can post
		if (message.guild.ownerID !== message.author.id) return null;

		// If the guild doesnt have a wall channel or if this is NOT the wall channel cancel it
		const wallChannelID = message.guild.settings.get(GuildSettings.Channels.WallID) as GuildSettings.Channels.TextChannelID;
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
			for (const reaction of postReactions) await posted.react(reaction);

			// Delete the original message the author posted to keep channel clean
			if (message.deletable && !message.deleted) await message.delete();

			// If an image was attached post the image in #photos
			if (imageURL) {
				const [photosChannel] = await message.guild.settings.resolve(GuildSettings.Channels.PhotosID);
				if (!photosChannel) return posted;

				await photosChannel.send(embed);
			}

			// Now we have to repost this in every followers feed
			for (const user of this.client.users.values()) {
				const [followers, serverID] = user.settings.pluck(UserSettings.Following, UserSettings.Profile.ServerID);
				// If this user is not following then skip
				if (!followers.includes(message.author.id)) continue;

				// This user is following so get the profile server for this user
				const guild = this.client.guilds.get(serverID);
				if (!guild) continue;

				// Get the channel from the settings
				const [feedChannel] = await guild.settings.resolve(GuildSettings.Channels.FeedID);
				if (!feedChannel) continue;

				// Make sure to catch these so we dont stop the whole loop on one error from 1 user
				const feedPost = await feedChannel.send(embed).catch(() => null);
				if (!feedPost) continue;

				for (const reaction of postReactions) await feedPost.react(reaction).catch(() => null);
			}

			// Return a message for the finalizers
			return posted;
		} catch (error) {
			// Silently error cause monitors are way too risky to send messages
			return this.client.emit('error', error);
		}
	}

}

