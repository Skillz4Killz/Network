import { Command, CommandStore, KlasaMessage, MessageEmbed } from '../../imports'
import { UserSettings } from '../../lib/types/settings/UserSettings';

export default class extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text', 'dm'],
			aliases: ['profile', 'cp'],
			description: 'Creates your profile to be able to meet new friends.',
			// extendedHelp: ''
		})
	}

	async run(message: KlasaMessage) {
		if (message.guild) await message.sendMessage('Sending DM to keep your profile information private.')

		const updates = []

		for (const question of questions) {
			// Ask the user the question and if they don't give a proper response cancel out
			const response = await this.ask(message, question.content, question.options)
			if (!response) return null

			updates.push([question.key, response])
		}

		// If there are no changes made just send a message saying its been cancelled
		if (!updates.length) return message.sendMessage('Cancelling out of profile creation as there were no changes detected from your current profile information.')

		// Update the users profile settings
		await message.author.settings.update(updates)

		return message.sendMessage('Profile settings has been updated. To try and find other people to match with, please use the **.match** command in a server somewhere.')
	}

	async ask(message: KlasaMessage, question: string, choices: string[]) {
		// Create the embed to send to the users DM
		const embed = new MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.addField(question, choices.join('\n'))
		// Send the embed to the user in DM because these are private questions
		await message.author.send(embed)

		// Await for a response from the user
		const messages = await message.channel.awaitMessages(response => response.author === message.author, { time: 120000, max: 1 })
		// If the user doesn't respond in the time limit then cancel it out
		if (messages.size < 1) return null

		return messages.first().content || null
	}
}

const questions = [
	{ id: 1, content: 'What language do you speak?', options: ['English', 'Español', 'Chinese', 'Other'], key: UserSettings.Profile.Language },
	{ id: 2, content: 'Would you be open to using voice chat with others?', options: ['Yes', 'No'] },
	{ id: 3, content: 'What is your favorite game?', options: ['Fornite', 'Minecraft', 'Discord', 'None', 'Other'] },
	{ id: 4, content: 'How much time do you spend on Discord daily?', options: ['< 1 hour', '< 3 hours', '< 5 hours', '>5 hours'] },
	{ id: 5, content: 'Do you like to share memes with others?', options: ['Yes', 'No', 'What are memes?', 'Memes are the death of intelligence.'] },
	{ id: 6, content: 'W', options: [''] },
	{ id: 7, content: '', options: [] },
	{ id: 8, content: '', options: [] },
	{ id: 9, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
	{ id: 10, content: '', options: [] },
]
