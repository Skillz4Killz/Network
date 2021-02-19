import {
  botCache,
  botID,
  cache,
  MessageReactionUncachedPayload,
  ReactionPayload,
  removeUserReaction,
  sendMessage,
} from "../../deps.ts";
import { db } from "../database/database.ts";
import { Embed } from "../utils/Embed.ts";

botCache.eventHandlers.reactionAdd = async function (message, emoji, userID) {
  // IGNORE REACTIONS UNTIL BOT IS READY
  if (!botCache.fullyReady) return;

  // Ignore all bot reactions
  if (userID === botID) return;

  // Process reaction collectors.
  botCache.helpers.processReactionCollectors(message, emoji, userID);

  // For this part reactions from DMs aren't important
  if (!message.guildID) return;

  // If its a bot or doesnt exist cancel out
  if (!message.member || message.member.user.bot) return;

  const settings = await db.guilds.get(message.guildID);
  if (!settings) return;

  switch (message.channelID) {
    // If it is one of the profile channels run the profile reaction handler
    case settings.feedChannelID:
    case settings.wallChannelID:
      return handleProfileReaction(message, emoji, userID).catch(console.log);
    default:
      return;
  }
};

async function handleProfileReaction(
  uncachedMessage: MessageReactionUncachedPayload,
  emoji: ReactionPayload,
  userID: string
) {
  const member = cache.members.get(userID);
  if (!member) return;

  const message = await botCache.helpers.getMessage(uncachedMessage.channelID, uncachedMessage.id);

  const postEmbed = message?.embeds[0];
  if (!postEmbed?.description) return;

  // Get the author id for the original author
  const originalAuthorID = postEmbed?.footer?.text;
  if (!originalAuthorID) return;

  const originalAuthorSettings = await db.users.get(originalAuthorID);
  if (!originalAuthorSettings) return;

  const originalAuthor = await botCache.helpers.fetchMember(originalAuthorSettings.profile.guildID, originalAuthorID);
  if (!originalAuthor) return;

  const originalGuildSettings = await db.guilds.get(originalAuthorSettings.profile.guildID);
  if (!originalGuildSettings?.notificationChannelID) return;

  switch (emoji.name) {
    case "❤":
      const heartEmbed = new Embed()
        .setAuthor(member.tag, member.avatarURL)
        .setTitle("❤ your Post")
        .setDescription(
          `[${
            postEmbed.description.length > 50 ? postEmbed?.description.substring(0, 50) + "..." : postEmbed?.description
          }](${message?.link})`
        );

      await sendMessage(originalGuildSettings.notificationChannelID, { embed: heartEmbed }).catch(console.log);

      // Send a response like Thank you for liking this users post delete it
      return message?.alertReply("Thank you for liking this user's post.", 5);
    case "🔁":
      const userSettings = await db.users.get(userID);
      if (!userSettings) return;

      const guildSettings = await db.guilds.get(userSettings.profile.guildID);
      if (!guildSettings?.wallChannelID)
        return message?.alertReply(
          "You have not set up your own profile server, so I am unable to repost this to your #wall. Please invite me to your private server and run the **.createnetwork** command.",
          5000
        );

      // Repost this message on the user, that reacted, wall channel
      const repost = await sendMessage(guildSettings.wallChannelID, { embed: postEmbed });
      repost.addReactions(["❤", "🔁", "➕"], true);

      const repostEmbed = new Embed()
        .setAuthor(member.tag, member.avatarURL)
        .setTitle("🔁 your Post")
        // TODO: `${user.tag} has reposted your post from ${message.guild.name} guild and it has now been shared to ${reactorGuild ? reactorGuild.name : "**Server Not Found**"} guild.`
        .setDescription(`${member.tag} has reposted your post`);

      await sendMessage(originalGuildSettings.notificationChannelID, { embed: repostEmbed }).catch(console.log);

      // Send a response and then delete it
      return message?.alertReply(
        `Thank you for reposting this user's post. You can now find it on your own wall channel <#${guildSettings?.wallChannelID}>.`,
        5000
      );
    case "➕": {
      // Follow the original author profile server
      const userSettings = await db.users.get(userID);
      if (!userSettings) return;

      // Check if the users already follows the user specified in the command
      const isAlreadyFollowing = userSettings?.following.includes(originalAuthorID);
      if (isAlreadyFollowing) {
        userSettings.following = userSettings?.following.filter((id) => id !== originalAuthorID);
      } else {
        userSettings.following.push(originalAuthorID);
      }

      await db.users.update(userID, { following: userSettings.following });

      await removeUserReaction(uncachedMessage.channelID, uncachedMessage.id, "➕", userID).catch(console.log);
      return message?.alertReply(`You are ${isAlreadyFollowing ? "no longer" : "now"} following this user.`, 5);
    }
  }
}
