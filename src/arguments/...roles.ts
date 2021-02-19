import { cache } from "../../deps.ts";
import { botCache } from "../../deps.ts";

botCache.arguments.set("...roles", {
  name: "...roles",
  execute: async function (argument, parameters, message) {
    if (!parameters.length) return;

    const guild = cache.guilds.get(message.guildID);
    if (!guild) return;

    return parameters.map((word) => {
      const roleID = word.startsWith("<@&") ? word.substring(3, word.length - 1) : word;

      const name = word.toLowerCase();
      const role = guild.roles.get(roleID) || guild.roles.find((r) => r.name.toLowerCase() === name);
      if (role) return role;
    });
  },
});
