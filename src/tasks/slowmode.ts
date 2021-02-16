import { botCache } from "../../deps.ts";

botCache.tasks.set(`slowmode`, {
  name: `slowmode`,
  interval: botCache.constants.milliseconds.MINUTE * 2,
  execute: async function () {
    const now = Date.now();
    botCache.slowmode.forEach(async (timestamp, key) => {
      if (now > timestamp) return;
      botCache.slowmode.delete(key);
    });
  },
});
