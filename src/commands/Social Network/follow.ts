import { Command, CommandStore, KlasaMessage, KlasaUser } from '../../imports';
import { UserSettings } from '../../lib/types/settings/UserSettings';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Follows/unfollows a user, thus making his posts appear in your feed.',
			usage: '<user:user>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {

		try {
			// Get an array of users that our user is following
			const following = message.author.settings.get(UserSettings.Following) as UserSettings.Following;

			// Check if the users already follows the user specified in the command
			const isAlreadyFollowing = following.includes(user.id);

			// Toggle the user in SG
			await user.settings.update(UserSettings.Following, user.id, { throwOnError: true });

			return message.sendMessage(`Successfully ${isAlreadyFollowing ? 'un' : ''}followed ${user.username}`);
		} catch (e) {
			// Classic error handling
			this.client.emit('error', e);
			return message.sendMessage('Gadzooks! An error has occured. My developers have been informed about it.');
		}

	}

}
