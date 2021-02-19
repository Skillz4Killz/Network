import { configs } from "../../configs.ts";
import { botCache, sendMessage } from "../../deps.ts";
import { Embed } from "../utils/Embed.ts";

botCache.eventHandlers.debug = async function (data) {
  // console.log(data);
  if (!data.type) return;

  switch (data.type) {
    // IGNORE THESE EVENTS
    case "requestCreate":
    case "requestFetch":
    case "requestFetched":
    case "requestSuccess":
    case "gatewayHeartbeat":
      return;
    // RUN ALL OTHER EVENTS
    default:
      if (configs.channelIDs.errorChannelID && botCache.fullyReady) {
        const embed = new Embed()
          .setColor("RANDOM")
          .setTitle(data.type)
          .setTimestamp()
          .setDescription(["```json", JSON.stringify(data.data), "```"].join("\n"));

        await sendMessage(configs.channelIDs.errorChannelID, { embed }).catch(console.log);
      }
  }
};
