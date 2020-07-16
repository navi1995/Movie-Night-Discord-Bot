# Movie Night Bot for Discord
This is a Discord Bot written in Node.JS using Discord.JS library to interface with the Discord API. 

MongoDB connection is required to store and retrieve settings as well as film details. The schema is available within bot.js

The Movie DB API is used to gather any relevant data to movies throughout the application.

## Setup
Create a config.json file in the root directory
```json
{
  "prefix": "set to whichever prefix you wish the bot to use.",
  "token": "set to your discord bot API token",
  "movieDbAPI": "set to your API token from developers.themoviedb.org (Required to get movie data when requested by user)",
  "mongoLogin": "set to your connection string for any MongoDB collection (Check Mongoose for more information)"
}
```

I would reccomend removing dblapi.js and references to topggAPI/testing from bot.js as this is simply to post statistics to a third party website.

Run index.js which will spawn a sharding manager, which runs bot.js to instantiate all commands and handle responses.

## Commands
List of commands available at https://movienightbot.xyz/commands/

## Approach
General development approach was followed from Discord.js documentation to ensure best practices were implemented in terms of bots. Many settings had to be adjusted to ensure my EC2 servers memory usage wouldn't climb indefinately with default options.

index.js will simply be spawning a sharding manager, which points to bot.js as the primary file to spawn. This is a required implementation by Discord after a bot has exceeded 2,500 servers.

Commands are seperated out into their own folder and script files, these are then loaded in by Bot.js and handles events/command execution. The default prefix is --

Bot.js will check every message for any alias/command text, if it is present it will continue with checks and execution. 

On leaving/kicked from a server, we delete settings and movies from that server
