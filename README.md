# Repository is now ARCHIVED!!!
No changes will be made here as I have moved to a Premium model to support the server costs of hosting the bot.


## Movie Night Bot for Discord
This is a Discord Bot written in Node.JS using Discord.JS library to interface with the Discord API. 

MongoDB connection is required to store and retrieve settings as well as film details. The schema is available within bot.js

The Movie DB API is used to gather any relevant data to movies throughout the application.

### Setup
Create a config.json file in the root directory
```json
{
  "token": "set to your discord bot API token",
  "movieDbAPI": "set to your API token from developers.themoviedb.org (Required to get movie data when requested by user)",
  "mongoLogin": "set to your connection string for any MongoDB collection (Check Mongoose for more information)",
  "topggAPI": "Top GG API token, you should remove this.",
  "testing": true // Remove or set to true so that stats are not posted.
}
```

I would recommend removing dblapi.js and references to topggAPI/testing from bot.js as this is simply to post statistics to a third party website.

Run index.js which will spawn a sharding manager, which runs bot.js to instantiate all commands and handle responses. 
