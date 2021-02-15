import { bgBlue, bgYellow, black, botCache, cache } from "../../deps.ts";
import { getTime } from "../utils/helpers.ts";
import { sweepInactiveGuildsCache } from "./dispatchRequirements.ts";

botCache.eventHandlers.ready = async function () {
  console.info(`Loaded ${botCache.arguments.size} Argument(s)`);
  console.info(`Loaded ${botCache.commands.size} Command(s)`);
  console.info(`Loaded ${Object.keys(botCache.eventHandlers).length} Event(s)`);
  console.info(`Loaded ${botCache.inhibitors.size} Inhibitor(s)`);
  console.info(`Loaded ${botCache.monitors.size} Monitor(s)`);
  console.info(`Loaded ${botCache.tasks.size} Task(s)`);

  // Special Task
  // After interval of the bot starting up, remove inactive guilds
  setInterval(() => {
    sweepInactiveGuildsCache();
  }, botCache.constants.milliseconds.HOUR);

  botCache.tasks.forEach(async (task) => {
    // THESE TASKS MUST RUN WHEN STARTING BOT
    if (["missions", "vipmembers"].includes(task.name)) await task.execute();

    setTimeout(async () => {
      console.log(`${bgBlue(`[${getTime()}]`)} => [TASK: ${bgYellow(black(task.name))}] Started.`);
      try {
        await task.execute();
      } catch (error) {
        console.log(error);
      }

      setInterval(async () => {
        if (!botCache.fullyReady) return;
        console.log(`${bgBlue(`[${getTime()}]`)} => [TASK: ${bgYellow(black(task.name))}] Started.`);
        try {
          await task.execute();
        } catch (error) {
          console.log(error);
        }
      }, task.interval);
    }, Date.now() % task.interval);
  });

  botCache.fullyReady = true;

  console.log(`[READY] Bot is online and ready in ${cache.guilds.size} guild(s)!`);
};
