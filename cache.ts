import { configs } from "./configs.ts";
import { Collection } from "./deps.ts";

export const botCache = {
  fullyReady: false,
  dispatchedGuildIDs: new Set<string>(),
  dispatchedChannelIDs: new Set<string>(),
  // arguments: new Collection<string, Argument>(),
  // commands: new Collection<string, Command<any>>(),
  // eventHandlers: {} as CustomEvents,

  vipUserIDs: new Set(configs.userIDs.botOwners),

  memberLastActive: new Collection<string, number>(),
  activeGuildIDs: new Set<string>(),

  // Guild Related Settings
  guildPrefixes: new Collection<string, string>(),
  guildLanguages: new Collection<string, string>(),
  vipGuildIDs: new Set([configs.supportServerID]),

  // messageCollectors: new Collection<string, MessageCollector>(),
  // reactionCollectors: new Collection<string, ReactionCollector>(),
  // inhibitors: new Collection<string, (message: Message, command: Command<any>, guild?: Guild) => Promise<boolean>>(),
  // monitors: new Collection<string, Monitor>(),
  // permissionLevels: new Collection<
  //   PermissionLevels,
  //   (message: Message, command: Command<any>, guild?: Guild) => Promise<boolean>
  // >(),
  // tasks: new Collection<string, Task>(),
  // helpers: {} as Helpers,
  // constants: {} as Constants,
  stats: {
    messagesProcessed: 0,
    messagesDeleted: 0,
    messagesEdited: 0,
    messagesSent: 0,
    reactionsAddedProcessed: 0,
    reactionsRemovedProcessed: 0,
    commandsRan: 0,
    feedbacksSent: 0,
    automod: 0,
  },
  slowmode: new Collection<string, number>(),
  blacklistedIDs: new Set<string>(),
};
