import { Event } from '../imports';

export default class extends Event {

	public async run() {
		const commandsToUnload = ['conf', 'userconf'];

		for (const name of commandsToUnload) {
			const command = this.client.commands.get(name);
			if (command) command.unload();
		}
	}

}
