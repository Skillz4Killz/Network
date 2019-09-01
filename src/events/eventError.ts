import { Event, TextChannel } from '../imports';
import configs from '../../configs';

export default class extends Event {

	public run(event, _args, error) {
		const errorMessage = `[EVENT] ${event.path}\n${error
			? error.stack
				? error.stack
				: error
			: 'Unknown error'}`;
		this.client.emit('wtf', errorMessage);

		// Emit an error to a discord channel
		const errorLogChannel = this.client.channels.get(configs.errorLogChannelID) as TextChannel;
		// If the channel wasnt found or missing permission to post in it
		if (!errorLogChannel || !errorLogChannel.postable) return null;

		return errorLogChannel.sendCode('ts', errorMessage);
	}

}
