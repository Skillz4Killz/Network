import { botCache, cache, fetchMembers } from "../../deps.ts";

botCache.arguments.set("member", {
  name: "member",
  execute: async function (_argument, parameters, message) {
    const [id] = parameters;
    if (!id) return;

    const guild = cache.guilds.get(message.guildID);
    if (!guild) return;

    const userID = id.startsWith("<@") ? id.substring(id.startsWith("<@!") ? 3 : 2, id.length - 1) : id;

    const cachedMember = cache.members.get(userID);
    if (cachedMember?.guilds.has(message.guildID)) return cachedMember;

    const cached = cache.members.find(
      (member) => member.guilds.has(message.guildID) && member.tag.toLowerCase().startsWith(userID.toLowerCase())
    );
    if (cached) return cached;

    if (userID.length < 17) return;

    if (!Number(userID)) return;

    console.log("Fetching a member with ID from gateway", userID);

    const member = await fetchMembers(guild, {
      userIDs: [userID],
    }).catch(console.log);
    if (!member) return;

    return member.first();
  },
});
