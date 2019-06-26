import { Command, CommandStore, KlasaMessage, MessageEmbed, Message } from '../../imports'
import { DiscordChannelTypes } from '../../lib/types/enums/DiscordJS';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { TextChannel } from 'discord.js';
import { UserSettings } from '../../lib/types/settings/UserSettings';

export default class extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text', 'dm'],
			aliases: ['profile', 'cp'],
			description: 'Creates your profile to be able to meet new friends.',
			extendedHelp: ''
		})
	}

	async run(message: KlasaMessage) {
		if (message.guild) {

		}

		for (const question of questions) {

		}
	}
}

const questions = [
	{ id: 1, content: 'What language do you speak?', options: ['English', 'Español', 'Chinese', 'Other'] },
	{ id: 2, content: 'Would you be open to using voice chat with others?', options: ['Yes', 'No'] },
	{ id: 3, content: ''}
]
