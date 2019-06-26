import { Snowflake } from 'discord.js'

export namespace UserSettings {
	export type Following = Snowflake[];
	export const Following = 'following';

	export namespace Profile {
		export type Language = string;
		export const Language = 'profile.language';
		export type ServerID = Snowflake;
		export const ServerID = 'profile.serverID';
		export type Gender = UserProfile.Gender;
		export const Gender = 'profile.gender';
		export type Age = number;
		export const Age = 'profile.age';
		export type LookingFor = UserProfile.GenderFlags;
		export const LookingFor = 'profile.lookingFor';
	}

}
