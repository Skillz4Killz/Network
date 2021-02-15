// import { loadLanguages } from "./src/utils/i18next.ts";
import { configs } from "./configs.ts";
import { botCache, Intents, startBot } from "./deps.ts";
import { fileLoader, importDirectory } from "./src/utils/helpers.ts";
import { loadLanguages } from "./src/utils/i18next.ts";

console.info("Beginning Bot Startup Process. This can take a little bit depending on your system. Loading now...");

// Load these first before anything else so they are available for the rest.
await importDirectory(Deno.realPathSync("./src/constants"));
await importDirectory(Deno.realPathSync("./src/helpers"));
await importDirectory(Deno.realPathSync("./src/events"));
await fileLoader();
if (!botCache.eventHandlers.debug) throw "No events loaded";

// The order of these is not important.
await Promise.all(
  [
    "./src/commands",
    "./src/inhibitors",
    "./src/arguments",
    "./src/monitors",
    "./src/tasks",
    "./src/permissionLevels",
  ].map((path) => importDirectory(Deno.realPathSync(path)))
);
await fileLoader();

if (!botCache.commands.size) throw "No commands loaded";
if (!botCache.arguments.size) throw "No args loaded";

console.info("Loading Languages...");
// Loads languages
await loadLanguages();
console.info("Loading Database");

await import("./src/database/database.ts");
console.log("Loaded Database, starting bot...");

startBot({
  token: configs.token,
  // Pick the intents you wish to have for your bot.
  intents: [
    Intents.GUILDS,
    Intents.GUILD_MESSAGES,
    Intents.DIRECT_MESSAGES,
    Intents.GUILD_MEMBERS,
    Intents.GUILD_BANS,
    Intents.GUILD_EMOJIS,
    Intents.GUILD_VOICE_STATES,
    Intents.GUILD_INVITES,
    Intents.GUILD_MESSAGE_REACTIONS,
    Intents.DIRECT_MESSAGE_REACTIONS,
  ],
  // These are all your event handler functions. Imported from the events folder
  eventHandlers: botCache.eventHandlers,
});
