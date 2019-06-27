import { Command, CommandStore, KlasaMessage, MessageEmbed, Message, TextChannel } from '../../imports';
import { DiscordChannelTypes } from '../../lib/types/enums/DiscordJS';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { UserSettings } from '../../lib/types/settings/UserSettings';

const rolesToCreate = [
	{ name: 'Subscriber', color: 'random' }
];

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['network', 'cn'],
			permissionLevel: 7,
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			description: 'Creates your Network profile server.',
			extendedHelp: ''
		});
	}

	public async run(message: KlasaMessage) {
		const wallChannelID = message.guild.settings.get(GuildSettings.Channels.WallID) as GuildSettings.Channels.TextChannelID;
		const userProfileServerID = message.author.settings.get(UserSettings.Profile.ServerID) as UserSettings.Profile.ServerID;

		if (wallChannelID) return message.sendMessage('Sorry, this server already has a setup for the social network. This command only works when the server is not setup. Please create a new server, invite the bot and try this command again.');
		if (userProfileServerID) return message.sendMessage(`Sorry, you can only have one profile server. You have set ${this.client.guilds.get(userProfileServerID).name} as your profile server.`);

		// Create the initial embed
		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setColor('RANDOM')
			.setFooter('This message will update you on the progress. Please bear with me as I set up the entire server.');

		try {
			// Send the initial message telling the user to hold on
			const response = await message.send(embed) as Message;

			// Create all the roles we need
			const rolesCreated = await Promise.all(rolesToCreate.map(roleData => message.guild.roles.create({ data: { name: roleData.name, color: roleData.color, hoist: true } })));

			// Edit the embed
			embed.addField('Roles Created', rolesCreated.map(role => role.toString()).join(' '));

			// Edit the message alerting the user the roles were created
			await response.edit(embed);

			const categoryChannel = await message.guild.channels.create('Social Network', { type: DiscordChannelTypes.category });
			// Edit the embed
			embed.addField('Social Network Category Created', categoryChannel);
			// Edit the message alerting the user the category was created
			await response.edit(embed);

			// Create the wall channel and deny send and add reactions permissions from everyone but the bot must have them
			const wallChannel = await message.guild.channels.create('wall', { type: DiscordChannelTypes.text, parent: categoryChannel.id, permissionOverwrites: [{ id: message.guild.id, deny: ['SEND_MESSAGES', 'ADD_REACTIONS'] }, { id: this.client.user.id, allow: ['SEND_MESSAGES', 'ADD_REACTIONS'] }] }) as TextChannel;
			// Edit the embed
			embed.addField('Wall Channel Created', wallChannel);
			// Edit the message alerting the user the wall channel was created
			await response.edit(embed);

			// TODO: Send the first message like welcome to TwitCordBook or some joke
			const startMessage = await wallChannel.sendEmbed(new MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setColor('RANDOM')
				.setDescription(`It's time to ditch Twitter and Facebook. All-in-one voice and text chat social network that's free, secure, and works on both your desktop and phone. Stop risking your private info with Facebook and hassling with Twitter. Simplify your life.`)
				.setFooter(message.author.id)
				.setTimestamp()) as Message;

			// Add the three custom reactions
			for (const reaction of ['❤', '🔁', '➕']) startMessage.react(reaction);

			// Create the notifications channel which no one can see
			const notificationsChannel = await message.guild.channels.create('notifications', { type: DiscordChannelTypes.text, parent: categoryChannel.id, permissionOverwrites: [{ id: message.guild.id, deny: ['VIEW_CHANNEL'] }, { id: this.client.user.id, allow: ['VIEW_CHANNEL'] }] });
			// Edit the embed
			embed.addField('Notification Channel Created', notificationsChannel);
			// Edit the message alerting the user the wall channel was created
			await response.edit(embed);

			// Create the photos channel which no one can see
			const photosChannel = await message.guild.channels.create('photos', { type: DiscordChannelTypes.text, parent: categoryChannel.id, permissionOverwrites: [{ id: message.guild.id, deny: ['SEND_MESSAGES'] }, { id: this.client.user.id, allow: ['SEND_MESSAGES'] }] });
			// Edit the embed
			embed.addField('Photos Channel Created', photosChannel);
			// Edit the message alerting the user the wall channel was created
			await response.edit(embed);

			// Create the feed channel which no one can see
			const feedChannel = await message.guild.channels.create('feed', { type: DiscordChannelTypes.text, parent: categoryChannel.id, permissionOverwrites: [{ id: message.guild.id, deny: ['SEND_MESSAGES'] }, { id: this.client.user.id, allow: ['SEND_MESSAGES'] }] });
			// Edit the embed
			embed.addField('Feed Channel Created', feedChannel);
			// Edit the message alerting the user the wall channel was created
			await response.edit(embed);

			// Update the settings with all the new channels and roles created
			await message.guild.settings.update([[GuildSettings.Channels.FeedID, feedChannel.id], [GuildSettings.Channels.NotificationsID, notificationsChannel], [GuildSettings.Channels.PhotosID, photosChannel.id], [GuildSettings.Channels.WallID, wallChannel.id], [GuildSettings.Roles.SubscriberID, rolesCreated[0].id]], { throwOnError: true });
			// Update the user settings
			await message.author.settings.update(UserSettings.Profile.ServerID, message.guild.id, { throwOnError: true });

			// Alert the user that it is done
			return message.sendMessage('Your social Network profile has now been created.');
		} catch (error) {
			this.client.emit('error', error);
			return message.sendMessage('Something went wrong while your profile was being created. I have contacted my developers with the error report.');
		}
	}

}
