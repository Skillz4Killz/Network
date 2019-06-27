export interface RawMessageReactionAdd {
	user_id: string;
	message_id: string;
	emoji: RawEmoji;
	channel_id: string;
	guild_id: string;
}

export interface RawEmoji {
	id: string | null;
	name: string;
	animated: boolean;
	roles?: string[];
	user?: RawUser;
	require_colons?: boolean;
	managed?: boolean;
}

export interface RawUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot?: boolean;
	mfa_enabled?: boolean;
	locale?: string;
	verified?: boolean;
	email?: string;
}
