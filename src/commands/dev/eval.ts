import { botCache, cache } from "../../../deps.ts";
import { db } from "../../database/database.ts";
import { PermissionLevels } from "../../types/commands.ts";
import { createCommand } from "../../utils/helpers.ts";

createCommand({
  name: "eval",
  permissionLevels: [PermissionLevels.BOT_OWNER],
  botChannelPermissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
  arguments: [
    {
      name: "async",
      type: "string",
      literals: ["async"],
      required: false,
    },
    {
      name: "depth",
      type: "string",
      literals: ["depth=1", "depth=2", "depth=3"],
      required: false,
    },
    {
      name: "code",
      type: "...string",
    },
  ] as const,
  execute: async function (message, args) {
    let success, result;
    let type;

    const skillz = {
      db,
      cache,
    };

    try {
      if (args.async) args.code = `(async () => {\n${args.code}\n})();`;
      result = eval(args.code);
      type = typeof result;

      if (result && typeof result.then === "function") {
        result = await result;
      }

      success = true;
    } catch (error) {
      type = typeof error;
      result = error;
      success = false;
    }

    if (typeof result !== "string") {
      result =
        result instanceof Error
          ? result.stack
          : Deno.inspect(result, {
              depth: args.depth ? parseInt(args.depth.substring(args.depth.length - 1)) || 4 : 4,
            });
    }

    if (!result) return botCache.helpers.reactError(message);

    const responses = botCache.helpers.chunkStrings(result.split(" "), 1900, false);

    if (responses.length === 1 && responses[0].length < 1900) {
      return message.send(["```ts", responses[0], "```", `**Type of:** ${type}`].join("\n"));
    }

    for (const response of responses) {
      await message.send(["```ts", response, "```"].join("\n")).catch(console.log);
    }

    return message.send(`**Type of:** ${type}`);
  },
});
