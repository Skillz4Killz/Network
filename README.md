# Network Bot

This is a discord bot built for the Discord Hack Week June 2019.

The bot adds some key functionalities to discord:

- True social network
- Server template networks
- Meet similar new people

## Social Network Feature

This feature brings some of the common functionalities of other social networks like twitter and Facebook to Discord. This bot helps make Discord be the only social network anyone would ever need.

- `.setupnetwork`=> creates all the channels and roles necessary for a full profile server. This server will serve as a facebook group/profile or twitter profile page.
  - #wall => channel that you make your posts in. 
    - Every message sent in this channel will get ❤️ and 🔄 reactions added. 
      - When someone taps the replay reaction it will post that message in their own wall channel like a retweet.
      - When the heart reaction is tapped a message is sent to notifications saying someone has liked this message. 
      - If the messages contains an image, that image will be sent in #photos to save all media.
      - Editing a message will edit all messages from all servers. 
    - Anyone following you will have this message sent to their #feed channel
    - Only bot can add new reactions on this channel. 
  - #feed channel will be where all messages are shown from all the people you follow.
  - #notifications => all alerts like new follower, someone liked, reposted etc
  - #photos will show all your photos.
  - @subscribers role that will be pinged whenever you make a post on the wall
- `.createprofile` begins a prompt style QA to create your profile.
- `.match` tinder style RichDisplay showing most common matching people to meet. 

## Server Templates

Something missing in discord is being able to make a new server using a template. 

- `.template create school` => creates an entire server based on a school server templates. 
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
- `.template add` adds the current server as a template that you can reuse in other places.
  
