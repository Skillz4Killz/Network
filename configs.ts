export const configs = {
    // Your bot  goes here
    : "OTcwMzM3MjM3NDAzMzIwNDYy.GSiw8s.NYnYg8zr_rhDKsr-reWLqgTPG1PwYaWtieAGc8",
    // The default prefix for your bot. Don't worry guilds can change this later.
    prefix: "!",
    // This isn't required but you can add bot list api keys here.
    botLists: {
      DISCORD_BOT_ORG: "",
      BOTS_ON_DISCORD: "",
      DISCORD_BOT_LIST: "",
      BOTS_FOR_DISCORD: "",
      DISCORD_BOATS: "",
      DISCORD_BOTS_GG: "",
      DISCORD_BOTS_GROUP: "",
    },
    // Custom Database settings
    database: {
      // Your mongodb atlas connection url string here
      connectionURL: "",
      name: "dev",
    },
    // This is the server id for your bot's main server where users can get help/support
    supportServerID: "",
    // This is the invite link for your bot's main server where users can get help/support
    botSupportInvite: "",
    // These are channel ids that will enable some functionality
    channelIDs: {
      // When a translation is missing this is the channel you will be alerted in.
      missingTranslation: "",
      // When an error occurs, we will try and log it to this channel
      errorChannelID: "",
      // When a server gets added/removed the bot will log it to this channel
      serverStats: "",
    },
    // These are the user ids that will enable some functionality.
    userIDs: {
      // You can delete the `as string[]` when you add atleast 1 id in them.
      // The user ids for the support team
      botSupporters: [] as string[],
      // The user ids for the other devs on your team
      botDevs: [] as string[],
      // The user ids who have complete 100% access to your bot
      botOwners: [] as string[],
      web: node index.js
    },
