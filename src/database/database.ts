import { Sabr, SabrTable } from "../../deps.ts";
import { ClientSchema, GuildSchema } from "./schemas.ts";

// Create the database class
const sabr = new Sabr();
// DEBUGGING CAN SHUT IT UP
sabr.error = async function () {};

export const db = {
  // This will allow us to access table methods easily as we will see below.
  sabr,
  client: new SabrTable<ClientSchema>(sabr, "client"),
  guilds: new SabrTable<GuildSchema>(sabr, "guilds"),
};

// This is important as it prepares all the tables.
await sabr.init();

console.log(`Fetching all settings that need to be cached`);
