import { botCache, botID } from "../../../deps.ts";
import { createCommand } from "../../utils/helpers.ts";
import { translate } from "../../utils/i18next.ts";

createCommand({
  name: "invite",
  botChannelPermissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
  execute: async function (message) {
    // TODO: better perm bits
    return message.send(
      [
        `**${translate(
          message.guildID,
          "strings:INVITE_BOT"
        )}:** <https://discordapp.com/oauth2/authorize?client_id=${botID}&scope=bot+applications.commands&permissions=2111302911>`,
        "",
        `${botCache.constants.emojis.bot} **${translate(
          message.guildID,
          "strings:NEED_SUPPORT"
        )}:** discord.gg/J4NqJ72`,
      ].join("\n")
    );
  },
});
