# Network Bot

This is a Discord bot built for the Discord Hack Week June 2019.

The bot adds some key functionalities to discord:

- True social networking
- Server templates
- Meeting similar people (coming soon)

## [➡️ Invite the Bot to Your Server 💌](https://discordapp.com/api/oauth2/authorize?client_id=591635332198301696&permissions=268512336&scope=bot)

## Features

### Social Network Feature

This feature brings some of the common functionalities of other social networks, like Twitter and Facebook, to Discord. This bot helps make Discord be the only social network anyone would ever need.

- `.createnetwork` => creates all the channels and roles necessary for a full profile server. This server will serve as a facebook group/profile or twitter profile page.
  - **#wall** => where you make your posts.
    - Every message sent in this channel will get ❤️ and 🔄 reactions added.
      - When someone taps the replay 🔄 reaction, it will repost that message in their own #wall channel, like a retweet.
      - When the heart ❤️ reaction is tapped, a message is sent to notifications saying someone has liked this message.
      - If the messages contains an image, that image will be sent in #photos to save all media.
      - Editing a message will edit that message in all servers.
    - Anyone following you will have this message sent to their #feed channel.
    - Only the bot can add new reactions on this channel.
  - **#feed** => the posts from all the people you follow.
  - **#notifications** => all alerts: someone followed you, liked your post, reposted your post, etc.
  - **#photos** => all your photos.
  - **@subscribers** => will be pinged whenever you make a post on the wall.
- (coming soon) `.createprofile` => begins a prompt style QA to create your profile.
- (coming soon) `.match` => matches you with other people on Discord; you can scroll left or right to find the perfect match and get in contact.

### Server Templates

Something missing in Discord is being able to make a new server using a template.

- `.createschool` => creates an entire server based on a school server templates.
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

## Developers

- [Skillz4Killz](https://discord.gg/rWMuMdk)
- [Charalampos Fanoulis](https://github.com/cfanoulis)
- [VoidTecc](https://github.com/VoidCodes)
- [Hutch Moore](https://github.com/tech6hutch)

## How We Built It

### Technology Used

1. [TypeScript](https://github.com/Microsoft/TypeScript) + [NodeJS](https://nodejs.org) - The language and runtime used by the bot.
2. [Discord.JS](https://discord.js.org) - The Discord API wrapper used.
3. [Klasa](https://klasa.js.org) - The most complete Discord.JS framework that helps make bot development easier.
4. [MongoDB](https://www.mongodb.com) - Database used to store information needed to make the bot work, like settings.
