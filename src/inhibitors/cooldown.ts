import { botCache, chooseRandom } from "../../deps.ts";
import { humanizeMilliseconds } from "../utils/helpers.ts";

const membersInCooldown = new Map<string, Cooldown>();

export interface Cooldown {
  used: number;
  timestamp: number;
}

const emojis = [
  botCache.constants.emojis.dab,
  botCache.constants.emojis.furious,
  botCache.constants.emojis.gamerCry,
  botCache.constants.emojis.poke,
  botCache.constants.emojis.slam,
  botCache.constants.emojis.snap,
  botCache.constants.emojis.tantrum,
  botCache.constants.emojis.twohundretIQ,
];

botCache.inhibitors.set("cooldown", async function (message, command, guild) {
  if (!command.cooldown) return false;

  const key = `${message.author.id}-${command.name}`;
  const cooldown = membersInCooldown.get(key);
  if (cooldown) {
    if (cooldown.used + 1 >= (command.cooldown.allowedUses || 1)) {
      const now = Date.now();
      if (cooldown.timestamp > now) {
        await message.reply(
          `${chooseRandom(emojis)} You must wait **${humanizeMilliseconds(
            cooldown.timestamp - now
          )}** before using this command again.`
        );

        console.log(`${command.name} Inhibited: Cooldown`);
        return true;
      }
    }

    membersInCooldown.set(key, {
      used: cooldown.used + 1,
      timestamp: cooldown.timestamp,
    });
    return false;
  }

  membersInCooldown.set(key, {
    used: 1,
    timestamp: Date.now() + command.cooldown.seconds * 1000,
  });
  return false;
});

setInterval(() => {
  const now = Date.now();

  membersInCooldown.forEach(async (cooldown, key) => {
    if (cooldown.timestamp > now) return;
    membersInCooldown.delete(key);
  });
}, 30000);
