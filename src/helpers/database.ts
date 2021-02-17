import { configs } from "../../configs.ts";
import { botCache } from "../../deps.ts";
import { db } from "../database/database.ts";

botCache.helpers.upsertGuild = async function (id: string) {
  const settings = await db.guilds.get(id);
  if (settings) return settings;

  // Create a new settings for this guild.
  await db.guilds.create(id, {
    // Basic settings
    id: id,
    prefix: configs.prefix,
    language: "en_US",

    wallChannelID: "",
    photosChannelID: "",
    feedChannelID: "",
    notificationChannelID: "",

    subscriberRoleIDs: [],
  });

  const guild = await db.guilds.get(id);
  return guild!;
};
