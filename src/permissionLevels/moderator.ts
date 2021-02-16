import { botCache } from "../../deps.ts";
import { db } from "../database/database.ts";
import { PermissionLevels } from "../types/commands.ts";

// The member using the command must be an admin. (Required ADMIN server perm.)
botCache.permissionLevels.set(PermissionLevels.MODERATOR, async (message) => {
  // If they lack the admin perms we can make a database call.
  const settings = await db.guilds.get(message.guildID);
  if (!settings) return false;

  return botCache.helpers.isModOrAdmin(message, settings);
});
