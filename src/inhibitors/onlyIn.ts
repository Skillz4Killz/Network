import { botCache } from "../../deps.ts";

botCache.inhibitors.set("onlyIn", async function (message, command, guild) {
  // If the command is guildOnly and does not have a guild, inhibit the command
  if (command.guildOnly && !guild) {
    console.log(`${command.name} Inhibited: ONLY IN`);
    return true;
  }
  // If the command is dmOnly and there is a guild, inhibit the command
  if (command.dmOnly && guild) {
    console.log(`${command.name} Inhibited: ONLY IN`);
    return true;
  }

  // The command should be allowed to run because it meets the requirements
  return false;
});
