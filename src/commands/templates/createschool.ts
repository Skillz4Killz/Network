import { Command, CommandStore, KlasaMessage, MessageEmbed, Message } from '../../imports';
import { DiscordChannelTypes } from '../../lib/types/enums/DiscordJS';

const roles = [
	{ name: 'Principles', color: '#800000' },
	{ name: 'Teachers', color: '#e6194B' },
	{ name: 'Parents', color: '#fabebe' },
	{ name: 'Students', color: '#9A6324' },
	{ name: 'Guests', color: '#f58231' },
	{ name: 'Pre-Kindergarden', color: '#ffd8b1' },
	{ name: 'Kindergarden', color: '#808000' },
	{ name: '1st Grade', color: '#ffe119' },
	{ name: '2nd Grade', color: '#fffac8' },
	{ name: '3rd Grade', color: '#bfef45' },
	{ name: '4th Grade', color: '#3cb44b' },
	{ name: '5th Grade', color: '#aaffc3' },
	{ name: '6th Grade', color: '#469990' },
	{ name: '7th Grade', color: '#42d4f4' },
	{ name: '8th Grade', color: '#000075' },
	{ name: '9th Grade', color: '#4363d8' },
	{ name: '10th Grade', color: '#911eb4' },
	{ name: '11th Grade', color: '#e6beff' },
	{ name: '12th Grade', color: '#f032e6' }
];

const VIEW_CHANNEL = ['VIEW_CHANNEL'];
const SEND_MESSAGES = ['SEND_MESSAGES'];
const VIEW_AND_SEND = ['VIEW_CHANNEL', 'SEND_MESSAGES'];

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['school'],
			permissionLevel: 7,
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			description: 'Creates a server using the school template.',
			extendedHelp: ''
		});
	}

	public async run(message: KlasaMessage) {
		// Create the initial embed
		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setFooter('This message will update you on the progress. Please bear with me as I set up the entire server.');

		try {
			// Tell the user to wait while we make everything
			const response = await message.send(embed) as Message;

			// Create all the roles that we will need at once
			const [principleRole, teacherRole, parentRole, studentRole, guestRole, prekRole, kindergardenRole, firstRole, secondRole, thirdRole, fourthRole, fifthRole, sixthRole, seventhRole, eightRole, ninthRole, tenthRole, eleventhRole, twelvethRole] = await Promise.all(
				roles.map(data => message.guild.roles.create({ data: { ...data, hoist: true }, reason: `${message.author.tag} ran the createserver school command.` }))
			);

			// Edit the embed
			embed.addField(`Roles Created`, `${principleRole} ${teacherRole} ${parentRole} ${studentRole} ${guestRole} ${prekRole} ${kindergardenRole} ${firstRole} ${secondRole} ${thirdRole} ${fourthRole} ${fifthRole} ${sixthRole} ${seventhRole} ${eightRole} ${ninthRole} ${tenthRole} ${eleventhRole} ${twelvethRole}`);
			// Edit the message with the new field added showing the user we made the roles
			await response.edit(embed);

			const classes = [
				{ name: 'Pre-Kindergarden', role: prekRole },
				{ name: 'Kindergarden', role: kindergardenRole },
				{ name: '1st Grade', role: firstRole },
				{ name: '2nd Grade', role: secondRole },
				{ name: '3rd Grade', role: thirdRole },
				{ name: '4th Grade', role: fourthRole },
				{ name: '5th Grade', role: fifthRole },
				{ name: '6th Grade', role: sixthRole },
				{ name: '7th Grade', role: seventhRole },
				{ name: '8th Grade', role: eightRole },
				{ name: '9th Grade', role: ninthRole },
				{ name: '10th Grade', role: tenthRole },
				{ name: '11th Grade', role: eleventhRole },
				{ name: '12th Grade', role: twelvethRole }
			];

			const channels = [
				{ name: 'important', permissionOverwrites: [{ id: teacherRole.id, allow: SEND_MESSAGES }, { id: message.guild.id, deny: VIEW_AND_SEND }], type: DiscordChannelTypes.text },
				{ name: 'homework-assignments', permissionOverwrites: [{ id: teacherRole.id, allow: SEND_MESSAGES }, { id: message.guild.id, deny: VIEW_AND_SEND }], type: DiscordChannelTypes.text },
				{ name: 'class-lessons', permissionOverwrites: [{ id: teacherRole.id, allow: SEND_MESSAGES }, { id: message.guild.id, deny: VIEW_AND_SEND }], type: DiscordChannelTypes.text },
				{ name: 'important-dates', permissionOverwrites: [{ id: teacherRole.id, allow: SEND_MESSAGES }, { id: message.guild.id, deny: VIEW_AND_SEND }], type: DiscordChannelTypes.text },
				{ name: 'main-chat', type: DiscordChannelTypes.text },
				{ name: 'study-together', type: DiscordChannelTypes.text },
				{ name: 'Class Meeting', permissionOverwrites: [], type: DiscordChannelTypes.voice }
			];

			for (const classData of classes) {
				const categoryPermissions = [{ id: message.guild.id, deny: VIEW_CHANNEL }, { id: this.client.user.id, allow: VIEW_CHANNEL }, { id: classData.role.id, allow: VIEW_CHANNEL }];
				// @ts-ignore
				const category = await message.guild.channels.create(classData.name, { type: DiscordChannelTypes.category, permissionOverwrites: categoryPermissions });

				const channelIDs = [];

				for (const channelData of channels) {
					// Create the channel under the category to inherit its
					const channel = await message.guild.channels.create(channelData.name, { type: channelData.type, parent: category.id });
					// Add the id to the array
					channelIDs.push(channel.id);
					// @ts-ignore
					if (channelData.permissionOverwrites && channelData.permissionOverwrites.length) await channel.edit({ permissionOverwrites: [...categoryPermissions, ...channelData.permissionOverwrites] });
				}

				// Edit the embed
				embed.addField(`Created ${classData.name} Section`, `Category: ${category.name}\n${channelIDs.map(id => `<#${id}>`).join(' ')}`);
				// Send the new edited embed
				await response.edit(embed);
			}

			return message.sendMessage('Your school server has been created 🎉.');
		} catch (error) {
			// Emit the error so it can be sent to us
			this.client.emit('error', error);
			// Return a message to the user saying something went wrong
			return message.sendMessage('Something went wrong while creating the server. I have alerted my developers.');
		}
	}

}
