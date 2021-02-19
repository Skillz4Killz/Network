import type { Message, MessageReactionUncachedPayload, ReactionPayload } from "../../deps.ts";
import type {
  CollectMessagesOptions,
  CollectReactionsOptions,
  MessageCollectorOptions,
  ReactionCollectorOptions,
} from "../types/collectors.ts";

import { botCache } from "../../deps.ts";
import { botID } from "../../deps.ts";

botCache.helpers.needMessage = async function (memberID: string, channelID: string, options?: MessageCollectorOptions) {
  const [message] = await botCache.helpers
    .collectMessages({
      key: memberID,
      channelID,
      createdAt: Date.now(),
      filter: options?.filter || ((msg) => memberID === msg.author.id),
      amount: options?.amount || 1,
      duration: options?.duration || botCache.constants.milliseconds.MINUTE * 5,
    })
    .catch((error) => {
      console.log(error);
      return [];
    });

  return message;
};

botCache.helpers.collectMessages = async function (options: CollectMessagesOptions): Promise<Message[]> {
  // CANCEL THE OLD ONE TO PREVENT MEMORY LEAKS
  botCache.messageCollectors.get(options.key)?.reject(`Failed To Collect A Message`);

  return new Promise((resolve, reject) => {
    botCache.messageCollectors.set(options.key, {
      ...options,
      messages: [],
      resolve,
      reject,
    });
  });
};

botCache.helpers.needReaction = async function (
  memberID: string,
  messageID: string,
  options?: ReactionCollectorOptions
) {
  const [reaction] = await botCache.helpers
    .collectReactions({
      key: memberID,
      messageID,
      createdAt: Date.now(),
      filter: options?.filter || ((userID) => memberID === userID),
      amount: options?.amount || 1,
      duration: options?.duration || botCache.constants.milliseconds.MINUTE * 5,
    })
    .catch((error) => {
      console.log(error);
      return [];
    });

  return reaction;
};

botCache.helpers.collectReactions = async function (options: CollectReactionsOptions): Promise<string[]> {
  // CANCEL THE OLD ONE TO PREVENT MEMORY LEAKS
  botCache.reactionCollectors.get(options.key)?.reject(`Failed To Collect A Reaction`);

  return new Promise((resolve, reject) => {
    botCache.reactionCollectors.set(options.key, {
      ...options,
      reactions: [] as string[],
      resolve,
      reject,
    });
  });
};

botCache.helpers.processReactionCollectors = function (
  message: Message | MessageReactionUncachedPayload,
  emoji: ReactionPayload,
  userID: string
) {
  // Ignore bot reactions
  if (userID === botID) return;

  const emojiName = emoji.id || emoji.name;
  if (!emojiName) return;

  const collector = botCache.reactionCollectors.get(userID);
  if (!collector) return;

  // This user has no collectors pending or the message is in a different channel
  if (!collector || message.id !== collector.messageID) return;
  // This message is a response to a collector. Now running the filter function.
  if (!collector.filter(userID, emojiName, message)) return;

  // If the necessary amount has been collected
  if (collector.amount === 1 || collector.amount === collector.reactions.length + 1) {
    // Remove the collector
    botCache.reactionCollectors.delete(userID);
    // Resolve the collector
    return collector.resolve([...collector.reactions, emojiName]);
  }

  // More reactions still need to be collected
  collector.reactions.push(emojiName);
};
