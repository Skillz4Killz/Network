import { botCache, botID, cache, cacheHandlers } from "../../deps.ts";

botCache.tasks.set(`sweeper`, {
  name: `sweeper`,
  interval: botCache.constants.milliseconds.MINUTE * 5,
  execute: async function () {
    const now = Date.now();
    // Delete presences from the bots cache.
    cacheHandlers.clear("presences");

    cache.members.forEach(async function (member) {
      if (member.id === botID) return;
      // ISEKAI BOT NEEDED FOR IDLE GAME
      if (member.id === "719912970829955094") return;

      // Delete any member who has not been active in the last 30 minutes and is not currently in a voice channel
      const lastActive = botCache.memberLastActive.get(member.id);
      // If the user is active recently
      if (lastActive && now - lastActive < botCache.constants.milliseconds.MINUTE * 30) {
        return;
      }

      cache.members.delete(member.id);
      botCache.memberLastActive.delete(member.id);
    });

    // For every, message we will delete if necessary
    cache.messages.forEach(async (message) => {
      // DM messages arent needed
      if (!message.guildID) {
        return cache.messages.delete(message.id);
      }

      if (botCache.messageCollectors.has(message.id) || botCache.reactionCollectors.has(message.id)) {
        return;
      }

      // Delete any messages over 10 minutes old
      if (now - message.timestamp > botCache.constants.milliseconds.MINUTE * 10) {
        cache.messages.delete(message.id);
      }
    });
  },
});
