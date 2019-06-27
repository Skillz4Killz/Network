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
		const following = message.author.settings.get('following') as KlasaUser[];
		const isAlreadyFollowing = following.some(followed => !(followed.id === user.id));
		if (isAlreadyFollowing) {
			const newFollowing = following.filter(followed => followed.id !== user.id);
			message.author.settings.update('following', newFollowing, { arrayAction: 'overwrite', throwOnError: true });
		} else {
			message.author.settings.update('following', user, { throwOnError: true });
		}
		message.sendMessage(`Successfully ${isAlreadyFollowing ? 'un' : ''}followed ${user.username}`);
	}

}
