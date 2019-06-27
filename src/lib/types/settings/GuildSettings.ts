import { Snowflake } from 'discord.js';

export namespace GuildSettings {
	export type Followers = Snowflake[];
	export const Followers = 'followers';

	export namespace Channels {
		export type TextChannelID = Snowflake;
		export const WallID = 'channels.wall';
		export const NotificationsID = 'channels.notifications';
		export const FeedID = 'channels.feed';
		export const PhotosID = 'channels.photos';
	}

	export namespace Roles {
		export type RoleID = Snowflake;
		export const SubscriberID = 'roles.subscriber';
	}

}
