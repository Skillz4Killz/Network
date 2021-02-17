import { botCache } from "../../../deps.ts";
import { db } from "../../database/database.ts";
import { parsePrefix } from "../../monitors/commandHandler.ts";
import { PermissionLevels } from "../../types/commands.ts";
import { Embed } from "../../utils/Embed.ts";
import { createSubcommand } from "../../utils/helpers.ts";

// This command will only execute if there was no valid sub command: !prefix
createSubcommand("settings", {
  name: "prefix",
  arguments: [
    {
      name: "prefix",
      type: "string",
      required: false,
    },
  ] as const,
  guildOnly: true,
  permissionLevels: [PermissionLevels.ADMIN, PermissionLevels.MODERATOR, PermissionLevels.SERVER_OWNER],
  execute: async function (message, args) {
    if (!args.prefix) {
      const embed = new Embed()
        .setTitle("Prefix Information")
        .setDescription(
          `
            **Current Prefix**: \`${parsePrefix(message.guildID)}\`
      `
        )
        .setTimestamp();

      return message.send({ embed });
    }

    if (args.prefix.length > 3) {
      return message.reply("Prefix input too long");
    }

    botCache.guildPrefixes.set(message.guildID, args.prefix);
    const settings = await botCache.helpers.upsertGuild(message.guildID);
    if (!settings) return botCache.helpers.reactError(message);

    await db.guilds.update(message.guildID, { prefix: args.prefix });

    return botCache.helpers.reactSuccess(message);
  },
});
