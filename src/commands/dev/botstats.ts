import { botCache, botGatewayData, botID, cache } from "../../../deps.ts";
import { db } from "../../database/database.ts";
import { PermissionLevels } from "../../types/commands.ts";
import { createCommand, humanizeMilliseconds } from "../../utils/helpers.ts";
import { Embed } from "./../../utils/Embed.ts";

createCommand({
  name: "botstats",
  guildOnly: true,
  permissionLevels: [PermissionLevels.BOT_OWNER, PermissionLevels.BOT_DEVS, PermissionLevels.BOT_SUPPORT],
  botChannelPermissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
  execute: async function (message) {
    let totalMemberCount = 0;
    let cachedMemberCount = 0;

    for (const guild of cache.guilds.values()) {
      totalMemberCount += guild.memberCount;
    }

    for (const member of cache.members.values()) {
      cachedMemberCount += member.guilds.size;
    }

    const stats = await db.client.get(botID);
    if (!stats) {
      await db.client.create(botID, {
        id: botID,
        botID,
        guildTemplates: [],
        messagesProcessed: "0",
        messagesDeleted: "0",
        messagesEdited: "0",
        messagesSent: "0",
        reactionsAddedProcessed: "0",
        reactionsRemovedProcessed: "0",
        commandsRan: "0",
        feedbacksSent: "0",
        automod: "0",
      });
      return message.reply("Stats table didn't return any data.");
    }

    const sessionStats = [
      `**Remaining:** ${botGatewayData.session_start_limit.remaining.toLocaleString()}`,
      `**Resets After:** ${humanizeMilliseconds(botGatewayData.session_start_limit.reset_after)}`,
      `**Total:** ${botGatewayData.session_start_limit.total.toLocaleString()}`,
      `**Shards:** ${botGatewayData.shards}`,
    ];

    const messageStats = [
      `**Processed:** ${botCache.helpers.shortNumber(BigInt(stats.messagesProcessed || "0"))}`,
      `**Sent:** ${botCache.helpers.shortNumber(BigInt(stats.messagesSent || "0"))}`,
      `**Deleted:** ${botCache.helpers.shortNumber(BigInt(stats.messagesDeleted || "0"))}`,
      `**Edited:** ${botCache.helpers.shortNumber(BigInt(stats.messagesEdited || "0"))}`,
      `**Commands:** ${botCache.helpers.shortNumber(BigInt(stats.commandsRan || "0"))}`,
    ];

    const reactionStats = [
      `**Added:** ${botCache.helpers.shortNumber(BigInt(stats.reactionsAddedProcessed || "0"))}`,
      `**Removed:** ${botCache.helpers.shortNumber(BigInt(stats.reactionsRemovedProcessed || "0"))}`,
    ];

    const embed = new Embed()
      .setColor("random")
      .addField("Servers", botCache.helpers.cleanNumber(cache.guilds.size + botCache.dispatchedGuildIDs.size), true)
      .addField("Dispatched", botCache.helpers.cleanNumber(botCache.dispatchedGuildIDs.size), true)
      .addField("Members", botCache.helpers.cleanNumber(totalMemberCount.toLocaleString()), true)
      .addField("Cached Members", botCache.helpers.cleanNumber(cachedMemberCount.toLocaleString()), true)
      .addField(
        "Channels",
        botCache.helpers.cleanNumber((cache.channels.size + botCache.dispatchedChannelIDs.size).toLocaleString()),
        true
      )
      .addBlankField(true)
      .addField("Session Start Limit", sessionStats.join("\n"), true)
      .addField("Messages", messageStats.join("\n"), true)
      .addField("Reactions", reactionStats.join("\n"), true)
      .setTimestamp();

    return message.send({ embed });
  },
});
