import { PermissionLevels } from "../../types/commands.ts";
import { createCommand } from "../../utils/helpers.ts";

createCommand({
  name: "exec",
  permissionLevels: [PermissionLevels.BOT_OWNER],
  arguments: [
    {
      name: "content",
      type: "...string",
    },
  ],
  execute: async function (message, args) {
    Deno.run({ cmd: args.content.split(" ") });
  },
});
