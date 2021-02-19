// This task will update the database once a minute with all the latest product analytics
import { botCache, botID } from "../../deps.ts";
import { db } from "../database/database.ts";

botCache.tasks.set(`botstats`, {
  name: `botstats`,
  // Runs this function once a minute
  interval: botCache.constants.milliseconds.MINUTE * 5,
  execute: async function () {
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
      return console.log("Botstats task was unable to run because no stats was found in DB.");
    }

    // Clone the current stats
    const currentBotStats = { ...botCache.stats };

    // Reset current stats
    botCache.stats.messagesDeleted = 0;
    botCache.stats.messagesEdited = 0;
    botCache.stats.messagesProcessed = 0;
    botCache.stats.messagesSent = 0;
    botCache.stats.reactionsAddedProcessed = 0;
    botCache.stats.reactionsRemovedProcessed = 0;
    botCache.stats.commandsRan = 0;
    botCache.stats.feedbacksSent = 0;
    botCache.stats.automod = 0;

    // Update the stats in the database.
    await db.client.update(botID, {
      ...stats,
      messagesDeleted: String(BigInt(stats.messagesDeleted || "0") + BigInt(currentBotStats.messagesDeleted)),
      messagesEdited: String(BigInt(stats.messagesEdited || "0") + BigInt(currentBotStats.messagesEdited)),
      messagesProcessed: String(BigInt(stats.messagesProcessed || "0") + BigInt(currentBotStats.messagesProcessed)),
      messagesSent: String(BigInt(stats.messagesSent || "0") + BigInt(currentBotStats.messagesSent)),
      reactionsAddedProcessed: String(
        BigInt(stats.reactionsAddedProcessed || "0") + BigInt(currentBotStats.reactionsAddedProcessed)
      ),
      reactionsRemovedProcessed: String(
        BigInt(stats.reactionsRemovedProcessed || "0") + BigInt(currentBotStats.reactionsRemovedProcessed)
      ),
      commandsRan: String(BigInt(stats.commandsRan || "0") + BigInt(currentBotStats.commandsRan)),
      feedbacksSent: String(BigInt(stats.feedbacksSent || "0") + BigInt(currentBotStats.feedbacksSent)),
      automod: String(BigInt(stats.automod || "0") + BigInt(currentBotStats.automod)),
    });
  },
});
