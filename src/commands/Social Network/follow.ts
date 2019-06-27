import { Command, CommandStore, KlasaMessage, KlasaUser } from '../../imports';
import { UserSettings } from '../../lib/types/settings/UserSettings';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			name: 'follow',
			description: 'Follows/Unfollows a user',
			usage: '<user:user>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {

		try {
			// Get an array of users that our user is following
			const following = message.author.settings.get('following') as KlasaUser[];

			// Check if the users already follows the user specified in the command
			const isAlreadyFollowing = following.some(followed => !(followed.id === user.id));

			/* Tell SG we have this user, and we need to add/remove it. In case it exists, it gets removed. Elsewise,
			*  the user is simply pushed into the array
			*/
			await user.settings.update(UserSettings.Following, user, { throwOnError: true });

			message.sendMessage(`Successfully ${isAlreadyFollowing ? 'un' : ''}followed ${user.username}`);

		} catch (e) {
			// Classic error handling
			message.sendMessage('Gadzooks! An error has occured. My developers have been informed about it.');
			this.client.emit('error', e);
		}

	}

}
