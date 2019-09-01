import { Event, TextChannel } from '../imports';
import configs from '../../configs';

export default class extends Event {

	public run(error) {
		this.client.console.error(error);

		// Emit an error to a discord channel
		const errorLogChannel = this.client.channels.get(configs.errorLogChannelID) as TextChannel;
		// If the channel wasnt found or missing permission to post in it
		if (!errorLogChannel || !errorLogChannel.postable) return null;

		return errorLogChannel.sendCode('ts', error);
	}

	public async init() {
		if (!this.client.options.consoleEvents.error) this.disable();
	}

}
