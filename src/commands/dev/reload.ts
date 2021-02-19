import i18next from "https://deno.land/x/i18next@v19.6.3/index.js";
import { botCache, updateEventHandlers } from "../../../deps.ts";
import { PermissionLevels } from "../../types/commands.ts";
import { createCommand, fileLoader, importDirectory } from "../../utils/helpers.ts";
import { loadLanguages } from "../../utils/i18next.ts";

const folderPaths = new Map([
  ["arguments", "./src/arguments"],
  ["commands", "./src/commands"],
  ["events", "./src/events"],
  ["inhibitors", "./src/inhibitors"],
  ["monitors", "./src/monitors"],
  ["tasks", "./src/tasks"],
  ["perms", "./src/permissionLevels"],
  ["helpers", "./src/helpers"],
  ["constants", "./src/constants"],
]);

createCommand({
  name: "reload",
  permissionLevels: [PermissionLevels.BOT_OWNER],
  botChannelPermissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
  arguments: [
    {
      name: "folder",
      type: "string",
      literals: [
        "arguments",
        "commands",
        "events",
        "inhibitors",
        "monitors",
        "tasks",
        "perms",
        "helpers",
        "constants",
        "strings",
      ],
      required: false,
    },
  ],
  execute: async function (message, args) {
    if (args.folder === "strings") {
      console.info("Loading Languages...");
      // Loads languages
      await loadLanguages();
      return botCache.helpers.reactSuccess(message);
    }
    // Reload a specific folder
    if (args.folder) {
      const path = folderPaths.get(args.folder);
      if (!path) {
        return message.reply("The folder you provided did not have a path available.");
      }

      await importDirectory(Deno.realPathSync(path));
      await fileLoader();
      return message.reply(`The **${args.folder}** has been reloaded.`);
    }

    // Reloads the main folders:
    await Promise.all([...folderPaths.values()].map((path) => importDirectory(Deno.realPathSync(path))));
    // Updates the events in the library
    updateEventHandlers(botCache.eventHandlers);
    i18next.reloadResources(
      botCache.constants.personalities.map((p) => p.id),
      undefined,
      undefined
    );

    await fileLoader();
    return message.reply("Reloaded everything.");
  },
});
