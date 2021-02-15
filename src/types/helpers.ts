import { Message } from "../../deps.ts";

export interface Helpers {
  // Collectors
  needMessage: (memberID: string, channelID: string, options?: MessageCollectorOptions | undefined) => Promise<Message>;
  collectMessages: (options: CollectMessagesOptions) => Promise<Message[]>;
  needReaction: (memberID: string, messageID: string, options?: ReactionCollectorOptions) => Promise<string>;
  collectReactions: (options: CollectReactionsOptions) => Promise<string[]>;
  processReactionCollectors: (
    message: Message | MessageReactionUncachedPayload,
    emoji: ReactionPayload,
    userID: string
  ) => void;

  // Discord Helpers
  reactError: (message: Message, vip?: boolean) => Promise<void>;
  reactSuccess: (message: Message) => Promise<void>;
}
