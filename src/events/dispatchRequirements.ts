import {
  botCache,
  botID,
  cache,
  delay,
  getChannels,
  getGuild,
  getMember,
  structures,
  UpdateGuildPayload,
} from "../../deps.ts";

const processing = new Set<string>();

botCache.eventHandlers.dispatchRequirements = async function (data, shardID) {
  if (!botCache.fullyReady) return;

  // DELETE MEANS WE DONT NEED TO FETCH. CREATE SHOULD HAVE DATA TO CACHE
  if (data.t && ["GUILD_CREATE", "GUILD_DELETE"].includes(data.t)) return;

  const id =
    data.t && ["GUILD_UPDATE"].includes(data.t)
      ? // deno-lint-ignore no-explicit-any
        (data.d as any)?.id
      : // deno-lint-ignore no-explicit-any
        (data.d as any)?.guild_id;

  if (!id || botCache.activeGuildIDs.has(id)) return;

  // If this guild is in cache, it has not been swept and we can cancel
  if (cache.guilds.has(id)) {
    botCache.activeGuildIDs.add(id);
    return;
  }

  // CERTAIN EVENTS ONLY USEFUL FOR VIP SERVERS
  if (
    data.t &&
    ["GUILD_MEMBER_UPDATE", "MESSAGE_UPDATE", "MESSAGE_DELETE", "VOICE_STATE_UPDATE"].includes(data.t) &&
    !botCache.vipGuildIDs.has(id)
  ) {
    return;
  }

  if (processing.has(id)) {
    console.log(`[DISPATCH] New Guild ID already being processed: ${id} in ${data.t} event`);

    let runs = 0;
    do {
      await delay(500);
      ++runs;
    } while (processing.has(id) && runs < 40);

    if (!processing.has(id)) return;

    return console.log(`[DISPATCH] Already processed guild was not successfully fetched:  ${id} in ${data.t} event`);
  }

  processing.add(id);

  // New guild id has appeared, fetch all relevant data
  console.log(`[DISPATCH] New Guild ID has appeared: ${id} in ${data.t} event`);

  const rawGuild = (await getGuild(id, true).catch(console.log)) as UpdateGuildPayload | undefined;

  if (!rawGuild) {
    processing.delete(id);
    return console.log(`[DISPATCH] Guild ID ${id} failed to fetch.`);
  }

  console.log(`[DISPATCH] Guild ID ${id} has been found. ${rawGuild.name}`);

  const [channels, botMember] = await Promise.all([
    getChannels(id, false),
    getMember(id, botID, { force: true }),
  ]).catch((error) => {
    console.log(error);
    return [];
  });

  if (!botMember || !channels) {
    processing.delete(id);
    return console.log(`[DISPATCH] Guild ID ${id} Name: ${rawGuild.name} failed. Unable to get botMember or channels`);
  }

  const guildBotMember = botMember.guilds.get(id);

  const guild = await structures.createGuild(
    {
      ...rawGuild,
      joined_at: guildBotMember ? new Date(guildBotMember.joinedAt).toISOString() : new Date().toISOString(),
      large: false,
      unavailable: false,
      member_count: rawGuild.approximate_member_count,
      voice_states: [],
      members: [],
      channels: [],
      presences: [],
    },
    shardID
  );

  // Add to cache
  cache.guilds.set(id, guild);
  botCache.dispatchedGuildIDs.delete(id);
  channels.forEach(async (channel) => {
    botCache.dispatchedChannelIDs.delete(channel.id);
    cache.channels.set(channel.id, channel);
  });

  processing.delete(id);

  console.log(`[DISPATCH] Guild ID ${id} Name: ${guild.name} completely loaded.`);
};

// Events that have
/**
 * channelCreate
 * channelUpdate
 * channelDelete
 * channelPinsUpdate
 * guildBanAdd
 * guildBanRemove
 * guildEmojisUpdate
 * guildIntegrationsUpdate
 * guildMemberAdd
 * guildMemberRemove
 * guildMemberUpdate
 * guildMembersChunk
 * guildRoleCreate
 * guildRoleUpdate
 * guildRoleDelete
 * inviteCreate
 * inviteDelete
 * messageCreate
 * messageUpdate
 * messageDelete
 * messageDeleteBulk
 * messageReactionAdd
 * messageReactionRemove
 * messageReactionRemoveAll
 * messageReactionRemoveEmoji
 * presenceUpdate
 * typingStart
 * voiceStateUpdate
 * voiceServerUpdate
 * webhooksUpdate
 */

// Events that dont have guild_id
/**
 * guildCreate id
 * guildUpdate id
 * guildDelete id
 */

export async function sweepInactiveGuildsCache() {
  for (const guild of cache.guilds.values()) {
    if (botCache.activeGuildIDs.has(guild.id)) continue;

    // This is inactive guild. Not a single thing has happened for atleast 30 minutes.
    // Not a reaction, not a message, not any event!
    cache.guilds.delete(guild.id);
    botCache.dispatchedGuildIDs.add(guild.id);
  }

  // Remove all channel if they were dispatched
  cache.channels.forEach(async (channel) => {
    if (!botCache.dispatchedGuildIDs.has(channel.guildID)) return;

    cache.channels.delete(channel.id);
    botCache.dispatchedChannelIDs.add(channel.id);
  });

  // Reset activity for next interval
  botCache.activeGuildIDs.clear();
}
