import { Command, CommandStore, KlasaMessage, TextChannel, GuildChannel, CategoryChannel, KlasaGuild, MessageEmbed } from '../../imports'
import { DiscordChannelTypes } from '../../lib/types/enums/DiscordJS';
import { ClientSettings } from '../../lib/types/settings/ClientSettings';
import { Message } from 'discord.js';

export default class extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text'],
			aliases: ['server', 'cs'],
			permissionLevel: 7,
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			description: 'Creates a server using a custom template.',
			usage: '<templateName:string>',
			usageDelim: ' ',
			extendedHelp: 'This command creates all roles and channels with the proper permissions based on another server. Use the **.createtemplate** command first to make a template from on of your other servers. Once you have a template, you can clone that server as many times as you wish. You can also ask other users for their templates name and use that as well if the user shares it with you.'
		})

		this.customizeResponse('templateName', 'You have to provide a template name. Please try again.')
	}

	async run(message: KlasaMessage, [templateName]: [string]) {
		// Get all the templates from the settings
		const templates = this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;
		// Check if the template name the user provided exists. If not return an error message to the user
		const template = templates.find(t => t.name === templateName.toLowerCase())
		if (!template) return message.sendMessage(`Sorry, I was not able to find a saved template in my settings with the name of ${templateName}. Make sure you have saved the template first using **.savetemplate** command.`)

		// Find the guild using the id from the template
		const guild = this.client.guilds.get(template.id)
		// Create the initial embed
		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setFooter('This message will update you on the progress. Please bare with me as I set up the entire server.')

		try {
			const response = await message.send(embed) as Message
			// Clone all the roles first so we can use the roles in the channel permissions later
			await Promise.all(guild.roles.map(role => message.guild.roles.create({ data: { name: role.name, color: role.color, hoist: role.hoist, permissions: role.permissions, mentionable: role.mentionable } })))

			// Tell the user we made the roles
			await response.edit(embed.addField('Roles Created', message.guild.roles.map(role => `<@&${role.id}>`).join(' ')))

			for (const channel of guild.channels.values()) {
				// If this channel does not have any category
				if (!channel.parentID) await this.handleChannelCreation(message, channel, guild)
				// If this is not a category channel skip
				if (channel.type !== 'category') continue

				// Create the category channel
				await this.handleChannelCreation(message, channel, guild)

				for (const childChannel of (channel as CategoryChannel).children.values()) {
					// If the channel perms are synced with the category just simply create the new channel with the parent
					if (childChannel.permissionsLocked) await message.guild.channels.create(childChannel.name, { type: DiscordChannelTypes[channel.type], parent: channel.id })
					// The channel has some unique permission that are not synced with the category
					else await this.handleChannelCreation(message, channel, guild)
				}
			}

			return message.sendMessage(`Your server has been created using the ${templateName} template.`)
		} catch (error) {
			this.client.emit('error', error)
			return message.sendMessage('Something went wrong in the server creation. I have contacted my developers with the error report.')
		}
	}

	async handleChannelCreation(message: KlasaMessage, channel: GuildChannel, guild: KlasaGuild) {
		const permsToUse = []

		for (const permission of channel.permissionOverwrites.values()) {
			// Is a role type permission
			if (permission.type === 'role') {
				const roleName = guild.roles.get(permission.id).name
				// find the role from this server using the role name since we created roles before making channel this role should exist
				const newRole = message.guild.roles.find(role => role.name === roleName)
				// If for whatever reason the role can not be found just skip to next
				if (!newRole) continue

				permsToUse.push({ id: newRole.id, allow: permission.allow, deny: permission.deny })
				continue;
			}

			// The permission is specifically has to be for a member
			try {
				const existingMember = message.guild.members.fetch(permission.id)
				// If the member doesnt exist on this server just skip this permission
				if (!existingMember) continue;

				permsToUse.push({ id: permission.id, allow: permission.allow, deny: permission.deny })
			} catch (error) {
				this.client.emit('error', error)
				continue
			}
		}

		// Create the channel using the perms we created above
		return message.guild.channels.create(channel.name, { type: DiscordChannelTypes[channel.type], nsfw: (channel as TextChannel).nsfw, permissionOverwrites: permsToUse })
	}
}
