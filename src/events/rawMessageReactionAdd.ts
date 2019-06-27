import { Event, EventStore, TextChannel, KlasaMessage, KlasaUser, Message } from '../imports';
import { RawMessageReactionAdd, RawEmoji } from '../lib/types/discord';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { UserSettings } from '../lib/types/settings/UserSettings';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_REACTION_ADD', emitter: store.client.ws });
	}

	public async run(data: RawMessageReactionAdd) {
		try {
			// Fetch the channel the reaction was on
			const channel = this.client.channels.get(data.channel_id) as TextChannel;
			// If the reaction is on DM or something we can ignore
			if (!channel || channel.type !== 'text') return null;
			// Fetch the message using the channel fetched above
			const message = await channel.messages.fetch(data.message_id) as KlasaMessage;
			if (!message) return null;
			// Fetch the user that reacted to the message
			const user = await this.client.users.fetch(data.user_id);
			// If its a bot or doesnt exist cancel out
			if (!user || user.bot) return null;

			const [wallChannelID, feedChannelID] = message.guild.settings.pluck(GuildSettings.Channels.WallID, GuildSettings.Channels.FeedID);

			switch (channel.id) {
				// If it is one of the profile channels run the profile reaction handler
				case feedChannelID:
				case wallChannelID: return this.handleProfileReaction(message, user, data.emoji);
				// Otherwise cancel out
				default: return null;
			}
		} catch (error) {
			return this.client.emit('error', error);
		}
	}

	public async handleProfileReaction(message: KlasaMessage, user: KlasaUser, emoji: RawEmoji) {
		try {
			const postEmbed = message.embeds[0];

			// Get the author id for the original author
			const originalAuthorID = postEmbed && postEmbed.footer && postEmbed.footer.text;
			if (!originalAuthorID) return null;

			const originalAuthor = await this.client.users.fetch(originalAuthorID);
			if (!originalAuthor) return null;

			const serverID = originalAuthor.settings.get(UserSettings.Profile.ServerID) as UserSettings.Profile.ServerID;
			if (!serverID) return null;

			const originalServer = this.client.guilds.get(serverID);
			if (!originalServer) return null;

			const notificationChannelID = originalServer.settings.get(GuildSettings.Channels.NotificationsID) as GuildSettings.Channels.TextChannelID;
			if (!notificationChannelID) return null;

			const notificationChannel = this.client.channels.get(notificationChannelID) as TextChannel;
			if (!notificationChannel) return null;

			switch (emoji.name) {
				case '❤': {
					// Send a notification to the original authors notification channel saying x user liked it
					await notificationChannel.send(`${user.tag} has liked your post in ${message.guild.name} guild.`);
					// Post the original embed so the user knows which post was liked
					await notificationChannel.send(postEmbed);

					// Send a response like Thank you for liking this users post delete it
					return message.channel.send(`Thank you for liking this user's post.`).then(response => (response as Message).delete({ timeout: 5000 }));
				}
				case '🔁': {
					const serverID = user.settings.get(UserSettings.Profile.ServerID) as UserSettings.Profile.ServerID;
					if (!serverID) return null;

					const reposterServer = this.client.guilds.get(serverID);
					if (!reposterServer) return null;

					const wallChannelID = reposterServer.settings.get(GuildSettings.Channels.WallID) as GuildSettings.Channels.TextChannelID;

					// If the reacting user doesnt have a wall channel tell cancel out
					const wallChannel = this.client.channels.get(wallChannelID) as TextChannel;
					if (!wallChannelID || !wallChannel) return message.channel.send('You have not set up your own profile server, so I am unable to repost this to your #wall. Please invite me to your private server and run the **.createnetwork** command.').then(response => (response as Message).delete({ timeout: 5000 }));

					// Repost this message on the user, that reacted, wall channel
					const reposted = await wallChannel.send(postEmbed) as Message;
					for (const reaction of ['❤', '🔁', '➕']) reposted.react(reaction);

					// Send a notification to the original authors notification channel saying x user reposted
					if (notificationChannelID) {
						const notificationChannel = this.client.channels.get(notificationChannelID) as TextChannel;
						if (!notificationChannel) return null;
						// Send a notification to the original authors notification channel saying x user liked it
						await notificationChannel.send(`${user.tag} has reposted your post in ${message.guild.name} guild and it has now been shared to ${originalServer.name} guild.`);
						// Post the original embed so the user knows which post was liked
						await notificationChannel.send(postEmbed);
					}

					// Send a response and then delete it
					return message.channel.send(`Thank you for reposting this user's post. You can now find it on your own wall channel <#${wallChannelID}>.`).then(response => (response as Message).delete({ timeout: 5000 }));
				}
				case '➕': {
					// Follow the original author profile server
					const following = user.settings.get(UserSettings.Following) as UserSettings.Following;
					await user.settings.update(UserSettings.Following, originalAuthorID, { throwOnError: true });

					// Remove the reaction that the user added so they can react again
					await message.reactions.get(emoji.name).users.remove(user.id);
					// Send a response saying you are now following or no longer following
					return message.channel.send(`You are ${following.includes(originalAuthorID) ? 'no longer' : 'now'} following this user.`).then(response => (response as Message).delete({ timeout: 5000 }));
				}
				default: return null;
			}
		} catch (error) {
			this.client.emit('error', error);
			return message.channel.send('Something went wrong. I have alerted my developers.').then(response => (response as Message).delete({ timeout: 5000 }));
		}
	}

}
