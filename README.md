<p align="center">
   <img src="https://cdn.discordapp.com/attachments/591623931664793612/594268158353866756/network-bot.png" width="200px" height="200px">
</p>

# Network Bot

![Time to ditch Titter and Facebook](https://i.imgur.com/iYXStzo.png)

This discord bot adds some key functionalities to discord:

- True social networking
- Server templates

## [➡️ Invite the Bot to Your Server 💌](https://discordapp.com/api/oauth2/authorize?client_id=591635332198301696&permissions=268512336&scope=bot)

You can join the [Support Server](https://discord.gg/GhSbrqYZKN) to contact the developers.

## Features

### Social Network Feature

This feature brings some of the common functionalities of other social networks, like Twitter and Facebook, to Discord. This bot helps make Discord be the only social network anyone would ever need.

![Social Network Example](https://i.imgur.com/XqujC86.png)

- `.createnetwork` => creates all the channels and roles necessary for a full profile server. This server will serve as a facebook group/profile or twitter profile page.
  - **#wall** => where you make your posts.
    - Anyone following you will have this message sent to their #feed channel.
    - Every message sent in this channel will get ❤️, 🔄, and ➕ reactions added.
      - 🔄: Repost that message in their own #wall channel, like a retweet.
      - ❤️: Send a message to #notifications saying someone has liked this message.
      - ➕: you will **follow/unfollow** the original poster.
  - **#feed** => the posts from all the people you follow.
  - **#notifications** => all alerts: someone followed you, liked your post, reposted your post, etc.
    ![Notification Example](https://i.imgur.com/nkuyvbM.png)
  - **#photos** => all your photos that you posted in #wall.
  - **@subscribers** => In case you want to ping users.
    - This will only work when you @subscribers and you assign the subscriber role to users. It is not done automatically to prevent abuse.
- `.follow @user` => follows a user so you can see all their posts on your own profile server #feed channel.

### Server Templates

Something missing in Discord is being able to make a new server using a template.

- `.createschool` => creates an entire server based on a school server template. Perfect for online schools like Forest Trails Academy.
  - @principles
  - @teachers
  - @parents
  - @students
  - @Guests
  - A category for each class is created
    - #homework-assignments
    - #class-lessons
    - #important-dates
    - #study-group
    - voice channels
  - PTA Category
    - #important-info
    - #questions
    - #meeting voice channels
- `.savetemplate` => adds the current server as a template that you can reuse in other places.
- `.removetemplate` => removes the current server as a template.
- `.createserver ServerID` creates a server using based on the template server you provided.

## Developers

- Skillz4Killz [Discord](https://discord.gg/GhSbrqYZKN) | [Github](https://github.com/Skillz4Killz)
- ITOH [Discord](https://discord.gg/GhSbrqYZKN) | [Github](https://github.com/itohatweb)

## How We Built It

### Technology Used

1. [TypeScript](https://github.com/Microsoft/TypeScript) + [Deno](https://deno.land) - The language and runtime used by the bot.
2. [Discordeno](https://discordeno.mod.land) - The Discord API wrapper used.
3. [Sabr](https://github.com/Skillz4Killz/Sabr) - Database used to store information needed to make the bot work, like settings.

## Steps To Host Your Own

1. Clone the repo. Give it a ⭐️at the top to support us.
2. Create the configs.ts file using the example file.
3. Create a Discord Bot at Discord Developer portal and get the token. Paste the token in the configs.ts file.
