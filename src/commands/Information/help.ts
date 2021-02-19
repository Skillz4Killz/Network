import { configs } from "../../../configs.ts";
import { botCache, cache } from "../../../deps.ts";
import { parsePrefix } from "../../monitors/commandHandler.ts";
import { Command } from "../../types/commands.ts";
import { createCommand } from "../../utils/helpers.ts";
import { translate } from "../../utils/i18next.ts";

createCommand({
  name: "help",
  aliases: ["h", "commands", "cmd", "cmds"],
  arguments: [
    {
      name: "all",
      type: "string",
      literals: ["all"],
      required: false,
    },
    {
      name: "command",
      type: "nestedcommand",
      required: false,
    },
  ] as const,
  execute: async function (message, args, guild) {
    if (!guild) return;

    const prefix = parsePrefix(message.guildID);

    if (!args.command || (args.command.nsfw && !cache.channels.get(message.channelID)?.nsfw)) {
      return message.reply(
        [
          translate(message.guildID, "strings:GENERAL_HELP"),
          `${translate(message.guildID, "strings:NEED_SUPPORT")} ${configs.botSupportInvite}`,
        ].join("\n")
      );
    }

    const [help, ...commandNames] = message.content.split(" ");

    let commandName = "";
    let relevantCommand: Command<any> | undefined;

    for (const name of commandNames) {
      // If no command name yet we search for a command itself
      if (!commandName) {
        const cmd =
          botCache.commands.get(name) ||
          botCache.commands.find((c) => Boolean(c.aliases?.includes(name.toLowerCase())));
        if (!cmd) return botCache.helpers.reactError(message);

        commandName = cmd.name.toUpperCase();
        relevantCommand = cmd;
        continue;
      }

      // Look for a subcommand inside the latest command
      const cmd =
        relevantCommand?.subcommands?.get(name) ||
        relevantCommand?.subcommands?.find((c) => Boolean(c.aliases?.includes(name.toLowerCase())));
      if (!cmd) break;

      commandName += `_${cmd.name.toUpperCase()}`;
      relevantCommand = cmd;
    }

    const USAGE = `**${translate(message.guildID, "strings:USAGE")}**`;
    const USAGE_DETAILS = translate(message.guildID, `strings:${commandName}_USAGE`, { prefix, returnObjects: true });
    let DESCRIPTION = args.command.description
      ? args.command.description.startsWith("strings:")
        ? translate(message.guildID, args.command.description, {
            returnObjects: true,
          })
        : args.command.description
      : "";
    if (Array.isArray(DESCRIPTION)) DESCRIPTION = DESCRIPTION.join("\n");

    const embed = botCache.helpers
      .authorEmbed(message)
      .setTitle(
        translate(message.guildID, `strings:COMMAND`, {
          name: commandNames.join(" "),
        })
      )
      .setDescription(DESCRIPTION || translate(message.guildID, `strings:${commandName}_DESCRIPTION`))
      .addField(
        USAGE,
        typeof args.command.usage === "string"
          ? args.command.usage
          : Array.isArray(args.command.usage)
          ? args.command.usage.map((details) => translate(message.guildID, details, { prefix })).join("\n")
          : Array.isArray(USAGE_DETAILS) && USAGE_DETAILS?.length
          ? USAGE_DETAILS.join("\n")
          : `${prefix}${commandNames.join(" ")}`
      )
      .setColor("48929b");
    if (args.command.aliases?.length) {
      embed.addField(
        translate(message.guildID, "strings:ALIASES"),
        args.command.aliases.map((alias) => `${prefix}${alias}`).join(", ")
      );
    }

    await message.send({ embed });
  },
});
