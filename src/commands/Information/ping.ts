import { createCommand } from "../../utils/helpers.ts";
import { translate } from "../../utils/i18next.ts";

createCommand({
  name: "ping",
  aliases: ["pong"],
  botChannelPermissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
  execute: async function (message) {
    message.reply(
      translate(message.guildID, `strings:PING_TIME`, {
        time: (Date.now() - message.timestamp) / 1000,
      })
    );
  },
});
