import { botCache } from "../../../cache.ts";
import { botID, cache, ChannelTypes, createGuildChannel, createGuildRole, OverwriteType } from "../../../deps.ts";
import { db } from "../../database/database.ts";
import { PermissionLevels } from "../../types/commands.ts";
import { Embed } from "../../utils/Embed.ts";
import { createCommand } from "../../utils/helpers.ts";

const rolesToCreate = [{ name: "Subscriber", color: "RANDOM" }];

function toColorNumber(color: string | number) {
  if (typeof color === "string") {
    if (color === "RANDOM") {
      color = Math.floor(Math.random() * (0xffffff + 1));
    } else if ((color as string).startsWith("#")) {
      color = parseInt((color as string).replace("#", ""), 16);
    }
  }
  return color as number;
}

createCommand({
  name: "createnetwork",
  aliases: ["network", "cn"],
  permissionLevels: [PermissionLevels.SERVER_OWNER],
  guildOnly: true,
  botServerPermissions: ["MANAGE_CHANNELS", "MANAGE_ROLES", "ADD_REACTIONS", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES"],
  description: "Creates your Network profile server.",
  execute: async function (message) {
    const guild = cache.guilds.get(message.guildID);
    if (!guild) return botCache.helpers.reactError(message);

    const settings = await botCache.helpers.upsertGuild(message.guildID);
    if (settings.wallChannelID) {
      return message.reply(
        "Sorry, this server already has a setup for the social network. This command only works when the server is not setup. Please create a new server, invite the bot and try this command aggain."
      );
    }

    const userProfile = await db.users.get(message.author.id);
    if (userProfile?.profile.guildID) {
      // TODO: `Sorry, you can only have one profile server. You have set ${this.client.guilds.get(userProfileServerID).name} as your profile server.`
      return message.reply(`Sorry, you can only have one profile server.`);
    }

    // Create the initial embed
    const embed = new Embed()
      .setAuthor(message.member!.tag, message.member?.avatarURL)
      .setColor("RANDOM")
      .setFooter("This message will update you on the progress. Please bear with me as I set up the entire server.");

    try {
      const response = await message.send({ embed });

      // Create all the roles we need
      const rolesCreated = await Promise.all(
        rolesToCreate.map((roleData) =>
          createGuildRole(message.guildID, { name: roleData.name, color: toColorNumber(roleData.color), hoist: true })
        )
      );

      // Edit the embed
      embed.addField("Roles Created", rolesCreated.map((role) => role.name).join(" "));
      await response.edit({ embed });

      const categoryChannel = await createGuildChannel(guild, "Social Network", { type: ChannelTypes.GUILD_CATEGORY });

      embed.addField("Social Network Category Created", categoryChannel.name!);
      response.edit({ embed });

      // Create the wall channel and deny send and add reactions permissions from everyone but the bot must have them
      const wallChannel = await createGuildChannel(guild, "wall", {
        type: ChannelTypes.GUILD_TEXT,
        parent_id: categoryChannel.id,
        permissionOverwrites: [
          {
            type: OverwriteType.ROLE,
            id: message.guildID,
            allow: [],
            deny: ["SEND_MESSAGES", "ADD_REACTIONS"],
          },
          {
            type: OverwriteType.MEMBER,
            allow: ["SEND_MESSAGES", "ADD_REACTIONS"],
            deny: [],
            id: botID,
          },
        ],
      });

      embed.addField("Wall Channel Created", wallChannel.name!);
      response.edit({ embed });

      // TODO: Send the first message like welcome to TwitCordBook or some joke
      const startMessage = await wallChannel.send({
        embed: new Embed()
          .setAuthor(message.member!.tag, message.member?.avatarURL)
          .setColor("RANDOM")
          .setDescription(
            "It's time to ditch Twitter and Facebook. All-in-one voice and text chat social network that's free, secure, and works on both your desktop and phone. Stop risking your private info with Facebook and hassling with Twitter. Simplify your life."
          )
          .setFooter(message.author.id)
          .setTimestamp(),
      });

      // Add the three custom reactions
      startMessage.addReactions(["❤", "🔁", "➕"], true);

      // Create the notifications channel which no one can see
      const notificationsChannel = await createGuildChannel(guild, "notifications", {
        type: ChannelTypes.GUILD_TEXT,
        parent_id: categoryChannel.id,
        permissionOverwrites: [
          {
            type: OverwriteType.ROLE,
            id: message.guildID,
            allow: [],
            deny: ["VIEW_CHANNEL"],
          },
          {
            type: OverwriteType.MEMBER,
            id: botID,
            allow: ["VIEW_CHANNEL"],
            deny: [],
          },
        ],
      });
      // Edit the embed
      embed.addField("Notification Channel Created", notificationsChannel.name!);
      // Edit the message alerting the user the wall channel was created
      await response.edit({ embed });

      const photosChannel = await createGuildChannel(guild, "photos", {
        type: ChannelTypes.GUILD_TEXT,
        parent_id: categoryChannel.id,
        permissionOverwrites: [
          {
            type: OverwriteType.ROLE,
            id: message.guildID,
            allow: [],
            deny: ["SEND_MESSAGES"],
          },
          {
            type: OverwriteType.MEMBER,
            id: botID,
            allow: ["SEND_MESSAGES"],
            deny: [],
          },
        ],
      });

      // Edit the embed
      embed.addField("Photos Channel Created", photosChannel.name!);
      // Edit the message alerting the user the wall channel was created
      await response.edit({ embed });

      const feedChannel = await createGuildChannel(guild, "feed", {
        type: ChannelTypes.GUILD_TEXT,
        parent_id: categoryChannel.id,
        permissionOverwrites: [
          {
            type: OverwriteType.ROLE,
            id: message.guildID,
            allow: [],
            deny: ["VIEW_CHANNEL"],
          },
          {
            type: OverwriteType.MEMBER,
            id: botID,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL"],
            deny: [],
          },
        ],
      });

      // Edit the embed
      embed.addField("Feed Channel Created", feedChannel.name!);
      // Edit the message alerting the user the wall channel was created
      await response.edit({ embed });

      // Update the settings with all the new channels and roles creatd
      await db.guilds.update(message.guildID, {
        feedChannelID: feedChannel.id,
        notificationChannelID: notificationsChannel.id,
        photosChannelID: photosChannel.id,
        wallChannelID: wallChannel.id,
        subscriberRoleIDs: rolesCreated.map((r) => r.id),
      });

      await db.users.create(message.author.id, {
        following: [],
        profile: { guildID: message.guildID, language: "english" },
      });

      // Alert the user that it is done
      return message.reply("Your social Network profile has now been created.");
    } catch (e) {}
  },
});
