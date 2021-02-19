// This task will help remove un-used collectors to help keep our cache optimized.
import { botCache } from "../../deps.ts";

botCache.tasks.set(`collectors`, {
  name: `collectors`,
  // Runs this function once a minute
  interval: botCache.constants.milliseconds.MINUTE,
  execute: async function () {
    const now = Date.now();

    botCache.messageCollectors.forEach(async (collector, key) => {
      // This collector has not finished yet.
      if (collector.createdAt + collector.duration > now) return;

      // Remove the collector
      botCache.messageCollectors.delete(key);
      // Reject the promise so code can continue in commands.
      return collector.reject(`Failed To Collect A Message ${key}`);
    });

    botCache.reactionCollectors.forEach(async (collector, key) => {
      // This collector has not finished yet.
      if (collector.createdAt + collector.duration > now) return;

      // Remove the collector
      botCache.reactionCollectors.delete(key);
      // Reject the promise so code can continue in commands.
      return collector.reject(`Failed To Collect A Reaction ${key}`);
    });
  },
});
