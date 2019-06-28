import { Command, klasaUtil, MessageEmbed, KlasaMessage, CommandStore } from '../../imports';

export default class extends Command {

	protected handlers: Map<any, any>;
	public constructor(store: CommandStore, file: string[], directory) {
		super(store, file, directory, {
			aliases: ['commands', 'cmd', 'cmds'],
			guarded: true,
			description: language => language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '[command:command]'
		});
	}

	public async run(message: KlasaMessage, [command]: [Command | undefined]) {
		// If a single command is given like `.help invite` we can just return a simple embed response
		if (command) {
			const embed = new MessageEmbed()
				.setTitle(command.name)
				.setDescription(klasaUtil.isFunction(command.description) ? command.description(message.language) : command.description)
				.addField('Usage', message.language.get('COMMAND_HELP_USAGE', command.usage.fullUsage(message)))
				.addField('Extended help', (klasaUtil.isFunction(command.extendedHelp) ? command.extendedHelp(message.language) : command.extendedHelp) ? klasaUtil.isFunction(command.extendedHelp) ? command.extendedHelp(message.language) : command.extendedHelp : 'The best way to learn is just to try it out.')
				.setColor('48929b')
				.setFooter(`Requested by ${message.author.username}`);

			return message.send(embed);
		}

		const prefix = message.guild.settings.get('prefix');
		const isOwner = message.guild.ownerID === message.author.id;
		const embed = new MessageEmbed()
			.setColor('48929b');

		const categoryCommands = {};
		for (const command of this.client.commands.values()) {
			// If its a bot owner command just skip
			if (command.permissionLevel === 10) continue;
			// create the full description whether its a function or a string. Functions are in core commands.
			const description = klasaUtil.isFunction(command.description) ? command.description(message.language) : command.description;
			// Check to see and create an array for this commands category if it doesnt exist
			if (!categoryCommands[command.category]) categoryCommands[command.category] = [];
			// Push the final description for this command
			categoryCommands[command.category].push(`\`${prefix}${command.name}\`${!isOwner && command.permissionLevel === 7 ? ' : **Server Owners Only**' : ''} => ${description}`);
		}

		for (const category of Object.keys(categoryCommands)) embed.addField(category, categoryCommands[category].join('\n'));

		return message.send(embed);
	}

}
