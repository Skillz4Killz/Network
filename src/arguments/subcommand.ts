import { botCache } from "../../deps.ts";

botCache.arguments.set("subcommand", {
  name: "subcommand",
  execute: async function (argument, parameters, message, command) {
    const [subcommandName] = parameters;

    const sub = command.subcommands?.find(
      (sub) => sub.name === subcommandName || Boolean(sub.aliases?.includes(subcommandName))
    );
    if (sub) return sub;

    return typeof argument.defaultValue === "string" ? command.subcommands?.get(argument.defaultValue) : undefined;
  },
});
