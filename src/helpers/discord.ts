import { botCache } from "../../deps.ts";
import { translate } from "../utils/i18next.ts";

botCache.helpers.reactError = async function (message, vip = false) {
  if (vip) {
    await message.reply(translate(message.guildID, "strings:NEED_VIP")).catch(console.log);
  }
  await message
    .addReaction("❌")
    .then(async () => {
      const reaction = await botCache.helpers.needReaction(message.author.id, message.id);
      if (reaction === "❌") {
        const details = [
          "",
          "",
          "**__Debug/Diagnose Data:__**",
          "",
          `**Message ID:** ${message.id}`,
          `**Channel ID:** ${message.channelID}`,
          `**Server ID:** ${message.guildID}`,
          `**User ID:** ${message.author.id}`,
        ];
        await message
          .reply(
            translate(message.guildID, "strings:NEED_HELP_ERROR", {
              invite: botCache.constants.botSupportInvite,
              details: details.join("\n"),
            })
          )
          .catch(console.log);
      }
    })
    .catch(console.log);
};

botCache.helpers.reactSuccess = function (message) {
  return message.addReaction(botCache.constants.emojis.success).catch(console.log);
};
