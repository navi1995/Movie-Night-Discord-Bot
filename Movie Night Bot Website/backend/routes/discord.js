const router = require('express').Router();
const User = require('../database/schemas/User');
const Movies = require('../database/schemas/Movies');
const Settings = require('../database/schemas/Settings');
const { getUserGuilds } = require('../utils/api')

router.get('/guilds', async (request, response) => {
	try {
		const user = await User.findOne({ discordId: request.user.discordId }); //Update with refresh tokens
		const userGuilds = await getUserGuilds(user.discordID);
		//const userGuilds = user.get('guilds'); Update DB?
		const userGuildIDs = userGuilds.map(guild => guild.id)
		const botGuilds = await Settings.find({ guildID: userGuildIDs });
		//Mod guilds
		// const userGuildsUnmapped = userGuilds.filter(guild => botGuilds.find(botGuild => botGuild.guildID == guild.id)); 
		const userGuildsMapped = userGuilds.reduce((reduction, guild) => {
			const adminLevel = (guild.permissions_new & 0x00000008) == 0x00000008 ? "admin" : ((guild.permissions_new & 0x00000020) == 0x00000020 ? "manage" : "user")
			const isBotInServer = botGuilds.find(botGuild => botGuild.guildID == guild.id && (adminLevel == "admin" || adminLevel == "manage"));
			
			if (isBotInServer || (adminLevel != "user" && !isBotInServer)) {
				reduction.push({
					...guild,
					adminLevel,
					isBotInServer: isBotInServer ? true : false
				});
			} 
			
			return reduction;
		}, []);

		if (user) {
			response.send(userGuildsMapped);
		} else {
			response.status(401).send({ message: "Unauthorized" });
		}
	} catch (err) {
		response.status(401).send({ message: "Unauthorized" });
	}
});


//Check if user requesting is actually in the guild
router.get('/movies/:guildID', async (request, response) => {
	const user = await User.findOne({ discordId: request.user.discordId }); //Update with refresh tokens
	const { guildID } = request.params;
	const userInGuild = isUserInGuild(user, guildID);

	if (userInGuild) {
		const movies = await Movies.find({ guildID },
			{
				_id: 0,
				primaryKey: 0,
				movieID: 0,
				__v: 0
			}); //Update with refresh tokens

		response.send(movies);
	} else {
		response.status(401).send({ message: "User is not in the guild." });
	}
});

function isUserInGuild(user, guildID) {
	const userGuilds = user.get('guilds');
	const userGuildIDs = userGuilds.map(guild => guild.id)

	return userGuildIDs.includes(guildID);
}
module.exports = router;