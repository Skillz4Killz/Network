import { sendMessage } from "https://deno.land/x/discordeno@10.3.0/src/api/handlers/channel.ts";
import { botCache } from "../../deps.ts";
import { db } from "../database/database.ts";
import { Embed } from "../utils/Embed.ts";
import { translate } from "../utils/i18next.ts";

const postReactions = ["❤", "🔁", "➕"];

botCache.monitors.set("wallpost", {
  name: "wallpost",
  botChannelPermissions: ["ADD_REACTIONS"],
  ignoreDM: true,
  execute: async function (message) {
    // Only owners can post
    if (message.author.id !== message.guild?.ownerID) return;

    // If the guild doesnt have a wall channel or if this is NOT the wall channel cancel it
    const settings = await db.guilds.get(message.guildID);
    if (!settings?.wallChannelID || settings.wallChannelID !== message.channelID) return;

    const imageURL = message.attachments[0]?.url;

    const embed = new Embed()
      .setAuthor(
        message.member?.tag ?? `${message.author.username}#${message.author.discriminator}`,
        message.author.avatar ?? ""
      )
      .setColor("RANDOM")
      .setDescription(message.content)
      .setImage(imageURL)
      .setTimestamp()
      .setFooter(message.author.id);

    // Resend the message as an embed
    const posted = await message.send({ embed });
    posted.addReactions(postReactions, true);

    // Delete the original message the author posted to keep channel clean
    await message.delete(translate(message.guildID, "strings:CLEAR_SPAM")).catch(console.log);

    // If an image was attached post the image in #photos
    if (imageURL && settings.photosChannelID) {
      await sendMessage(settings.photosChannelID, { embed });
    }

    // Now we have to repost this in every followers feed
    const users = await db.users.findMany((u) => u.following.includes(message.author.id));
    users.forEach(async (user) => {
      const settings = await db.guilds.get(user.profile.guildID);
      if (!settings?.feedChannelID) return;

      // Make sure to catch these so we don't stop the whole loop on one error from 1 user
      const feedPost = await sendMessage(settings.feedChannelID, { embed }).catch(console.log);
      if (!feedPost) return;

      feedPost.addReactions(postReactions, true);
    });
  },
});
