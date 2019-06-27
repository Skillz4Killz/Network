import { Event } from '../imports';
import { RawMessageReactionAdd } from '../lib/types/discord';
import { TextChannel } from 'discord.js';

export default class extends Event {

	// This tells Klasa to use the raw event
	emitter = this.client.ws;
	// This tells Klasa the event to listen to
	name = 'MESSAGE_REACTION_ADD';

	async run(data: RawMessageReactionAdd) {
		const channel = this.client.channels.get(data.channel_id) as TextChannel;
		if (!channel || channel.type === 'text') return null;

		const message = await channel.messages.fetch(data.message_id);
		if (!message) return null;


	}

}
