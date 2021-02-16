import { botCache, cache } from "../../deps.ts";

botCache.arguments.set("...emojis", {
  name: "...emojis",
  execute: async function (_argument, parameters, message) {
    if (!parameters.length) return;

    const emojis = parameters.map((e) => (e.startsWith("<:") ? e.substring(e.lastIndexOf(":") + 1, e.length - 1) : e));

    return emojis
      .map((emoji) => {
        if (botCache.constants.emojis.defaults.has(emoji)) return emoji;

        let guildEmoji = cache.guilds.get(message.guildID)?.emojis.filter((e) => e.id === emoji);
        if (!guildEmoji) {
          for (const guild of cache.guilds.values()) {
            const globalemoji = guild.emojis.find((e) => e.id === emoji);
            if (!globalemoji?.id) continue;

            emoji = globalemoji.id;
            break;
          }
        }
      })
      .filter((e) => e);
  },
});
