import { createCommand } from "../utils/helpers.ts";

createCommand({
  name: "ping",
  aliases: ["pong"],
  botChannelPermissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
  execute: async function (message) {
    message.reply(`🏓 Response Time: ${(Date.now() - message.timestamp) / 1000} seconds 🕙`);
  },
});
