import { Event, KlasaMessage, Command, TextChannel } from '../imports';
import configs from '../../configs';

export default class extends Event {

	public run(message: KlasaMessage, command: Command, _params: any[], error) {
		if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
		if (error.message) message.sendCode('JSON', error.message).catch(err => this.client.emit('wtf', err));
		else message.sendMessage(error).catch(err => this.client.emit('wtf', err));

		// Emit an error to a discord channel
		const errorLogChannel = this.client.channels.get(configs.errorLogChannelID) as TextChannel;
		// If the channel wasnt found or missing permission to post in it
		if (!errorLogChannel || !errorLogChannel.postable) return null;

		return errorLogChannel.sendCode('ts', error.message || error);
	}

}
