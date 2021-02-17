import { Message } from "https://deno.land/x/discordeno@10.3.0/src/api/structures/message.ts";
import { MessageReactionUncachedPayload, ReactionPayload } from "https://deno.land/x/discordeno@10.3.0/src/types/message.ts";
import { botCache, botID } from "../../deps.ts";
import { db } from "../database/database.ts";

botCache.eventHandlers.reactionAdd = async function (message, emoji, userID){
  // IGNORE REACTIONS UNTIL BOT IS READY
  if (!botCache.fullyReady) return;

  // Ignore all bot reactions
  if (userID === botID) return;

  // Process reaction collectors.
  botCache.helpers.processReactionCollectors(message, emoji, userID);

  // For this part reactions from DMs aren't important 
  if (!message.guildID) return

  // If its a bot or doesnt exist cancel out
  if (!message.member || message.member.user.bot) return
  
  const settings = await db.guilds.get(message.guildID)
  if (!settings) return

  switch (message.channelID) {
    // If it is one of the profile channels run the profile reaction handler
    case settings.feedChannelID:
    case settings.wallChannelID:
      return handleProfileReaction(message, emoji, userID).catch(console.log);
    default:
      return;
  }
};

async function handleProfileReaction(uncachedMessage: MessageReactionUncachedPayload, emoji: ReactionPayload, userID: string) {
  const message = await botCache.helpers.getMessage(uncachedMessage.channelID, uncachedMessage.id);

  const postEmbed = message?.embeds[0]

  // Get the author id for the original author
  const originalAuthorID = postEmbed?.footer?.text
  if (!originalAuthorID) return

  const originalAuthorSettings = await db.users.get(originalAuthorID)
  if (!originalAuthorSettings) return
  
  const originalAuthor = await botCache.helpers.fetchMember(originalAuthorSettings.profile.guildID, originalAuthorID)
  if (!originalAuthor) return
  
  const originalGuild = await db.guilds.get(originalAuthorSettings.profile.guildID)
  if (!originalGuild?.notificationChannelID) return;

  switch (emoji.name) {
    case "❤":
                // Send a notification to the original authors notification channel saying x user liked it
                await notificationChannel.send(`${user.tag} has liked your post in ${message.guild.name} guild.`);
                // Post the original embed so the user knows which post was liked
                await notificationChannel.send(postEmbed);
      
                // Send a response like Thank you for liking this users post delete it
                return message.channel
                  .send(`Thank you for liking this user's post.`)
                  .then((response) => (response as Message).delete({ timeout: 5000 }));
  }
}


  public async handleProfileReaction(message: KlasaMessage, user: KlasaUser, emoji: RawEmoji) {
    try {

      const notificationChannelID = originalServer.settings.get(
        GuildSettings.Channels.NotificationsID
      ) as GuildSettings.Channels.TextChannelID;
      if (!notificationChannelID) return null;

      const notificationChannel = this.client.channels.get(notificationChannelID) as TextChannel;
      if (!notificationChannel) return null;

      switch (emoji.name) {
        case "❤": {
          // Send a notification to the original authors notification channel saying x user liked it
          await notificationChannel.send(`${user.tag} has liked your post in ${message.guild.name} guild.`);
          // Post the original embed so the user knows which post was liked
          await notificationChannel.send(postEmbed);

          // Send a response like Thank you for liking this users post delete it
          return message.channel
            .send(`Thank you for liking this user's post.`)
            .then((response) => (response as Message).delete({ timeout: 5000 }));
        }
        case "🔁": {
          const serverID = user.settings.get(UserSettings.Profile.ServerID) as UserSettings.Profile.ServerID;
          if (!serverID) return null;

          const reposterServer = this.client.guilds.get(serverID);
          if (!reposterServer) return null;

          const wallChannelID = reposterServer.settings.get(
            GuildSettings.Channels.WallID
          ) as GuildSettings.Channels.TextChannelID;

          // If the reacting user doesnt have a wall channel tell cancel out
          const wallChannel = this.client.channels.get(wallChannelID) as TextChannel;
          if (!wallChannelID || !wallChannel)
            return message.channel
              .send(
                "You have not set up your own profile server, so I am unable to repost this to your #wall. Please invite me to your private server and run the **.createnetwork** command."
              )
              .then((response) => (response as Message).delete({ timeout: 5000 }));

          // Repost this message on the user, that reacted, wall channel
          const reposted = (await wallChannel.send(postEmbed)) as Message;
          for (const reaction of ["❤", "🔁", "➕"]) reposted.react(reaction);

          // Send a notification to the original authors notification channel saying x user reposted
          if (notificationChannelID) {
            const notificationChannel = this.client.channels.get(notificationChannelID) as TextChannel;
            if (!notificationChannel) return null;
            // Send a notification to the original authors notification channel saying x user liked it
            const [reactorGuild] = await user.settings.resolve(UserSettings.Profile.ServerID);

            await notificationChannel.send(
              `${user.tag} has reposted your post from ${message.guild.name} guild and it has now been shared to ${
                reactorGuild ? reactorGuild.name : "**Server Not Found**"
              } guild.`
            );
            // Post the original embed so the user knows which post was liked
            await notificationChannel.send(postEmbed);
          }

          // Send a response and then delete it
          return message.channel
            .send(
              `Thank you for reposting this user's post. You can now find it on your own wall channel <#${wallChannelID}>.`
            )
            .then((response) => (response as Message).delete({ timeout: 5000 }));
        }
        case "➕": {
          // Follow the original author profile server
          const following = user.settings.get(UserSettings.Following) as UserSettings.Following;
          await user.settings.update(UserSettings.Following, originalAuthorID, { throwOnError: true });

          // Remove the reaction that the user added so they can react again
          await message.reactions.get(emoji.name).users.remove(user.id);
          // Send a response saying you are now following or no longer following
          return message.channel
            .send(`You are ${following.includes(originalAuthorID) ? "no longer" : "now"} following this user.`)
            .then((response) => (response as Message).delete({ timeout: 5000 }));
        }
        default:
          return null;
      }
    } catch (error) {
      this.client.emit("error", error);
      return message.channel
        .send("Something went wrong. I have alerted my developers.")
        .then((response) => (response as Message).delete({ timeout: 5000 }));
    }
  }
}
