import { Event, TextChannel } from '../imports';
import configs from '../../configs';

export default class extends Event {

	public run(failure) {
		this.client.console.wtf(failure);

		// Emit an error to a discord channel
		const errorLogChannel = this.client.channels.get(configs.errorLogChannelID) as TextChannel;
		// If the channel wasnt found or missing permission to post in it
		if (!errorLogChannel || !errorLogChannel.postable) return null;

		return errorLogChannel.sendCode('ts', failure);
	}

	public async init() {
		if (!this.client.options.consoleEvents.wtf) this.disable();
	}

}
