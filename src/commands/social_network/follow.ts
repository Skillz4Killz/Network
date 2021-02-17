import { configs } from "../../../configs.ts";
import { db } from "../../database/database.ts";
import { createCommand } from "../../utils/helpers.ts";

createCommand({
  name: "follow",
  description: "Follows/unfollows a user, thus making his posts appear in your feed.",
  arguments: [
    {
      name: "user",
      type: "snowflake",
    },
  ],
  execute: async function (message, args) {
    // Get an array of users that our user is following
    const settings = await db.users.get(message.author.id);
    if (!settings)
      return message.reply(
        `Hey, it looks like you haven't set up a network server yet. To follow someone, first create a new server and run ${configs.prefix}createnetwork`
      );

    // Check if the users already follows the user specified in the command
    const isAlreadyFollowing = settings?.following.includes(args.user);
    if (isAlreadyFollowing) {
      settings.following = settings?.following.filter((id) => id !== args.user);
    } else {
      settings.following.push(args.user);
    }

    await db.users.update(message.author.id, { following: settings.following });
    return message.reply({
      content: `Successfully ${isAlreadyFollowing ? "un" : ""}followed <@!${args.user}>`,
      mentions: { parse: [] },
    });
  },
});
