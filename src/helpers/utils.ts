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

botCache.helpers.shortNumber = function (number: bigint | number | string) {
  const digits = number.toString();
  // Less than 1000
  if (digits.length < 4) return digits;

  const sets: [number, number, string][] = [
    [7, 3, "K"],
    [10, 6, "M"],
    [13, 9, "B"],
    [16, 12, "T"],
    [19, 15, "q"],
    [22, 18, "Q"],
    [25, 21, "s"],
    [28, 24, "S"],
    [32, 27, "o"],
    [35, 30, "n"],
    [38, 33, "d"],
    [42, 36, "U"],
    [45, 39, "Du"],
    [48, 42, "Td"],
    [52, 45, "qd"],
    [55, 48, "Qd"],
    [58, 51, "sd"],
    [62, 54, "Sd"],
    [65, 57, "Od"],
    [68, 60, "Nd"],
    [72, 63, "V"],
    [75, 66, "aa"],
    [78, 69, "ab"],
  ];

  for (const [length, size, letter] of sets) {
    if (digits.length >= length) continue;
    const index = digits.length - size;
    const end = digits.slice(index, index + 2);
    return `${digits.slice(0, index)}${end === "00" ? "" : `.${end}`}${letter}`;
  }

  return digits;
};
