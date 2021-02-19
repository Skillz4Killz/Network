import { botCache } from "../../deps.ts";

const SNOWFLAKE_REGEX = /[0-9]{17,19}/;

botCache.arguments.set("snowflake", {
  name: "snowflake",
  execute: async function (argument, parameters) {
    let [text] = parameters;
    if (!text) return;

    switch (true) {
      case text.startsWith("<@&"):
      case text.startsWith("<@!"):
        text = text.substring(3, text.length - 1);
        break;
      case text.startsWith("<#"):
      case text.startsWith("<@"):
        text = text.substring(2, text.length - 1);
        break;
    }
    console.log(text);

    return SNOWFLAKE_REGEX.test(text) ? text : undefined;
  },
});
