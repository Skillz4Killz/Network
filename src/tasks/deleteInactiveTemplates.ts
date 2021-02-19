import { botCache } from "../../cache.ts";
import { botID, cache } from "../../deps.ts";
import { db } from "../database/database.ts";

botCache.tasks.set("deleteInactiveTemplates", {
  name: "deleteInactiveTemplates",
  interval: botCache.constants.milliseconds.DAY,
  execute: async function () {
    // Get the templates
    const templates = (await db.client.get(botID))?.guildTemplates;

    // Filter out all the inactive guilds
    const newTemplates = templates?.filter((id) => botCache.dispatchedGuildIDs.has(id) || cache.guilds.has(id));

    if (templates?.length === newTemplates?.length) return;

    // Update the database to remove all guilds that no longer exist
    db.client.update(botID, { guildTemplates: newTemplates });
  },
});
