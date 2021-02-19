import {
  botCache,
  botHasChannelPermissions,
  botHasPermission,
  botID,
  cache,
  hasChannelPermissions,
  memberIDHasPermission,
} from "../../deps.ts";

botCache.eventHandlers.messageCreate = async function (message) {
  // Update stats in cache
  botCache.stats.messagesProcessed += 1;
  if (message.author.id === botID) botCache.stats.messagesSent += 1;
  if (!cache.isReady || !botCache.fullyReady) return;

  botCache.monitors.forEach(async (monitor) => {
    // The !== false is important because when not provided we default to true
    if (monitor.ignoreBots !== false && message.author.bot) return;
    if (monitor.ignoreDM !== false && !message.guildID) {
      return;
    }

    if (monitor.ignoreEdits && message.editedTimestamp) return;
    if (monitor.ignoreOthers && message.author.id !== botID) return;

    // Permission checks

    // No permissions are required
    if (
      !monitor.botChannelPermissions?.length &&
      !monitor.botServerPermissions?.length &&
      !monitor.userChannelPermissions?.length &&
      !monitor.userServerPermissions?.length
    ) {
      return monitor.execute(message);
    }

    // If some permissions is required it must be in a guild
    if (!message.guildID) return;

    // Check if the message author has the necessary channel permissions to run this monitor
    if (monitor.userChannelPermissions) {
      const results = await Promise.all(
        monitor.userChannelPermissions.map((perm) =>
          hasChannelPermissions(message.channelID, message.author.id, [perm])
        )
      );
      if (results.includes(false)) return;
    }

    // Check if the message author has the necessary permissions to run this monitor
    const member = cache.members.get(message.author.id)?.guilds.get(message.guildID);
    if (member && monitor.userServerPermissions) {
      const results = await Promise.all(
        monitor.userServerPermissions.map((perm) => memberIDHasPermission(message.author.id, message.guildID, [perm]))
      );
      if (results.includes(false)) return;
    }

    // Check if the bot has the necessary channel permissions to run this monitor in this channel
    if (monitor.botChannelPermissions) {
      const results = await Promise.all(
        monitor.botChannelPermissions.map((perm) => botHasChannelPermissions(message.channelID, [perm]))
      );
      if (results.includes(false)) return;
    }

    // Check if the bot has the necessary permissions to run this monitor
    if (monitor.botServerPermissions) {
      const results = await Promise.all(
        monitor.botServerPermissions.map((perm) => botHasPermission(message.guildID, [perm]))
      );
      if (results.includes(false)) return;
    }

    await monitor.execute(message).catch(console.log);
  });
};
