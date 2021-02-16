import { botCache } from "../../deps.ts";
import { translate } from "../utils/i18next.ts";

botCache.arguments.set("boolean", {
  name: "boolean",
  execute: async function (_argument, parameters, message) {
    const [boolean] = parameters;

    if (
      [
        "true",
        "false",
        "on",
        "off",
        "enable",
        "disable",
        translate(message.guildID, "strings:TRUE"),
        translate(message.guildID, "strings:FALSE"),
        translate(message.guildID, "strings:ON"),
        translate(message.guildID, "strings:OFF"),
        translate(message.guildID, "strings:ENABLE"),
        translate(message.guildID, "strings:DISABLE"),
      ].includes(boolean)
    ) {
      return [
        "true",
        "on",
        translate(message.guildID, "strings:TRUE"),
        translate(message.guildID, "strings:ON"),
        translate(message.guildID, "strings:ENABLE"),
        translate(message.guildID, "strings:DISABLE"),
      ].includes(boolean);
    }
  },
});
