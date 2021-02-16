import { botCache } from "../../deps.ts";
import { PermissionLevels } from "../types/commands.ts";
import { memberIDHasPermission } from "../../deps.ts";
import { db } from "../database/database.ts";

// The member using the command must be an admin. (Required ADMIN server perm.)
botCache.permissionLevels.set(PermissionLevels.ADMIN, async (message) => {
  const hasAdminPerm = await memberIDHasPermission(message.author.id, message.guildID, ["ADMINISTRATOR"]);
  if (hasAdminPerm) return true;

  // If they lack the admin perms we can make a database call.
  const settings = await db.guilds.get(message.guildID);
  if (!settings) return false;

  return botCache.helpers.isAdmin(message);
});
