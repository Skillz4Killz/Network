import { Command, CommandStore, KlasaMessage, KlasaUser } from '../../imports';

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

			/* In case isAlreadyFollowing is true, remove the user from the array and update the array in the DB
			*  In case isAlreadyFollowing is false, push the new user in the DB's array directly
			*/
			if (isAlreadyFollowing) {
				const newFollowing = following.filter(followed => followed.id !== user.id);
				message.author.settings.update('following', newFollowing, { arrayAction: 'overwrite', throwOnError: true });
			} else {
				message.author.settings.update('following', user, { throwOnError: true });
			}
			message.sendMessage(`Successfully ${isAlreadyFollowing ? 'un' : ''}followed ${user.username}`);

		} catch (e) {
			// Classic error handling
			message.sendMessage('Gadzooks! An error has occured. My developers have been informed about it.');
			this.client.emit('error', e);
		}

	}

}
