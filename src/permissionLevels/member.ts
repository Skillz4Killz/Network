import { botCache } from "../../deps.ts";
import { PermissionLevels } from "../types/commands.ts";

// The member using the command must be one of the bots dev team
botCache.permissionLevels.set(PermissionLevels.MEMBER, async () => true);
