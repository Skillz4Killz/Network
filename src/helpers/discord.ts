import { configs } from "../../configs.ts";
import { botCache, botHasChannelPermissions, cache, Collection, fetchMembers, Member } from "../../deps.ts";
import { translate } from "../utils/i18next.ts";

// botCache.helpers.isModOrAdmin = (message, settings) => {
//   const guild = cache.guilds.get(message.guildID);
//   if (!guild) return false;

//   const member = cache.members.get(message.author.id)?.guilds.get(message.guildID);
//   if (!member) return false;

//   if (botCache.helpers.isAdmin(message, settings)) return true;
//   if (!settings) return false;

//   return settings.modRoleIDs?.some((id) => member.roles.includes(id));
// };

// botCache.helpers.isAdmin = (message, settings) => {
//   const guild = cache.guilds.get(message.guildID);
//   if (!guild) return false;

//   const member = cache.members.get(message.author.id)?.guilds.get(message.guildID);
//   const hasAdminPerm = memberIDHasPermission(message.author.id, message.guildID, ["ADMINISTRATOR"]);
//   if (hasAdminPerm) return true;

//   return member && settings?.adminRoleID ? member.roles.includes(settings.adminRoleID) : false;
// };

// botCache.helpers.snowflakeToTimestamp = function (id) {
//   return Math.floor(Number(id) / 4194304) + 1420070400000;
// };

botCache.helpers.reactError = async function (message) {
  await message
    .addReaction("❌")
    .then(async () => {
      const reaction = await botCache.helpers.needReaction(message.author.id, message.id);
      if (reaction === "❌") {
        const details = [
          "",
          "",
          "**__Debug/Diagnose Data:__**",
          "",
          `**Message ID:** ${message.id}`,
          `**Channel ID:** ${message.channelID}`,
          `**Server ID:** ${message.guildID}`,
          `**User ID:** ${message.author.id}`,
        ];
        await message
          .reply(
            translate(message.guildID, "strings:NEED_HELP_ERROR", {
              invite: configs.botSupportInvite,
              details: details.join("\n"),
            })
          )
          .catch(console.log);
      }
    })
    .catch(console.log);
};

botCache.helpers.reactSuccess = function (message) {
  return message.addReaction(botCache.constants.emojis.success).catch(console.log) as Promise<void>;
};

botCache.helpers.emojiReaction = function (emoji) {
  const animated = emoji.startsWith("<a:");
  return `${animated ? "a:" : ""}${emoji.substring(
    animated ? 3 : 2,
    emoji.lastIndexOf(":")
  )}:${botCache.helpers.emojiID(emoji)}`;
};

botCache.helpers.emojiID = function (emoji) {
  if (!emoji.startsWith("<")) return;
  return emoji.substring(emoji.lastIndexOf(":") + 1, emoji.length - 1);
};

botCache.helpers.emojiUnicode = function (emoji) {
  return emoji.animated || emoji.id ? `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>` : emoji.name || "";
};

botCache.helpers.moveMessageToOtherChannel = async function (message, channelID) {
  const channel = cache.channels.get(channelID);
  if (!channel) return;

  if (!(await botHasChannelPermissions(channelID, ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"]))) {
    return;
  }

  const newMessage = await channel.send({
    content: message.content,
    embed: message.embeds[0],
  });
  if (!newMessage) return;

  await message.delete();
  return newMessage;
};

botCache.helpers.fetchMember = async function (guildID, id) {
  // Dumb ts shit on array destructuring https://github.com/microsoft/TypeScript/issues/13778
  if (!id) return;

  const userID = id.startsWith("<@") ? id.substring(id.startsWith("<@!") ? 3 : 2, id.length - 1) : id;

  const guild = cache.guilds.get(guildID);
  if (!guild) return;

  const cachedMember = cache.members.get(userID);
  if (cachedMember) return cachedMember;

  // When gateway is dying
  // return getMember(guildID, id);

  // Fetch from gateway as it is much better than wasting limited HTTP calls.
  const member = await fetchMembers(guild, { userIDs: [userID] }).catch(() => undefined);
  return member?.first();
};

botCache.helpers.fetchMembers = async function (guildID, ids) {
  const userIDs = ids.map((id) =>
    id.startsWith("<@") ? id.substring(id.startsWith("<@!") ? 3 : 2, id.length - 1) : id
  );

  const guild = cache.guilds.get(guildID);
  if (!guild) return;

  const members = new Collection<string, Member>();

  for (const userID of userIDs) {
    const cachedMember = cache.members.get(userID);
    if (cachedMember?.guilds.has(guildID)) members.set(userID, cachedMember);
  }

  const uncachedIDs = userIDs.filter((id) => !members.has(id));
  if (members.size === ids.length || !uncachedIDs.length) return members;

  // Fetch from gateway as it is much better than wasting limited HTTP calls.
  const remainingMembers = await fetchMembers(guild, {
    userIDs: uncachedIDs,
  }).catch(console.log);

  if (!remainingMembers) return members;

  for (const member of remainingMembers.values()) {
    members.set(member.id, member);
  }

  return members;
};

botCache.helpers.memberTag = function (message) {
  const member = cache.members.get(message.author.id);
  if (member) return member.tag;

  return `${message.author.username}#${message.author.discriminator}`;
};
