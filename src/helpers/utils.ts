import { botCache, cache } from "../../deps.ts";
import { Embed } from "../utils/Embed.ts";

botCache.helpers.chooseRandom = <T>(array: T[]) => {
  return array[Math.floor(Math.random() * array.length)]!;
};

botCache.helpers.toTitleCase = (text: string) => {
  return text
    .split(" ")
    .map((word) => (word[0] ? `${word[0].toUpperCase()}${word.substring(1).toLowerCase()}` : word))
    .join(" ");
};

botCache.helpers.chunkStrings = function (array: string[], size = 2000, separateLines = true) {
  const responses: string[] = [];
  let response = "";
  for (const text of array) {
    const nextText = response.length && separateLines ? `\n${text}` : text;
    if (response.length + nextText.length >= size) {
      responses.push(response);
      response = "";
    }
    response += nextText;
  }
  responses.push(response);
  return responses;
};

botCache.helpers.authorEmbed = function (message) {
  const member = cache.members.get(message.author.id);
  const embed = new Embed().setColor("random");
  if (!member) return embed;

  return embed.setAuthor(member.tag, member.avatarURL);
};

botCache.helpers.cleanNumber = function (number: bigint | number | string) {
  const digits = number.toString().split("");
  let counter = 0;

  let result = "";
  // Run the loop over the digits in reverse
  for (const digit of digits.reverse()) {
    if (counter < 3) {
      counter++;
      result = `${digit}${result}`;
      continue;
    }

    // Adds a , to split the number
    result = `${digit},${result}`;
    // Resets the counter
    counter = 1;
  }

  return result;
};
