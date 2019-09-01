import { KlasaMessage, Command } from '../../imports';
import { CommandStore } from 'klasa';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			permissionLevel: 7,
			usage: '[prefix:string]'
		});
	}

	public async run(message: KlasaMessage, [prefix = '.']: [string]) {
		await message.guild.settings.update(GuildSettings.Prefix, prefix);

		return message.sendMessage(`The prefix for this server has been changed to **${prefix}**.`);
	}


}
