export interface ClientSchema {
  id: string;
  botID: string;
  // Templates
  guildTemplates: string[];
  // Bot Statistics. Using string to prevent big ints from breaking.
  messagesProcessed: string;
  messagesDeleted: string;
  messagesEdited: string;
  messagesSent: string;
  reactionsAddedProcessed: string;
  reactionsRemovedProcessed: string;
  commandsRan: string;
  feedbacksSent: string;
  automod: string;
}

export interface GuildSchema {
  // Basic settings
  id: string;
  prefix: string;
  language: string;

  wallChannelID: string;
  photosChannelID: string;
  feedChannelID: string;
  notificationChannelID: string;

  subscriberRoleIDs: string[];
}

export interface UserSchema {
  following: string[];
  profile: {
    guildID: string;
    language: string;
  };
}
