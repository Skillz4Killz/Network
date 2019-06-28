import { Snowflake } from 'discord.js';

export module ClientSettings {
	export type GuildTemplates = Snowflake[];
	export const GuildTemplates = 'guildTemplates';
}
