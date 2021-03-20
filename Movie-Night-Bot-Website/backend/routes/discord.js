const router = require('express').Router();
const User = require('../database/schemas/User');
const Movies = require('../database/schemas/Movies');
const Settings = require('../database/schemas/Settings');
const { Parser } = require('json2csv');
const { getUserGuilds} = require('../utils/api');
const { hasDeletePermissions, isUserInGuild } = require('../utils/utils');

//Returns all guilds for a user.
router.get('/guilds', async (request, response) => {
	try {
		const user = await User.findOne({ discordID: request.user.discordID });
		const userGuilds = await getUserGuilds(user.discordID); //This updates the guilds against user in our mongoDB as well.
		const userGuildIDs = userGuilds.map(guild => guild.id);
		const botGuilds = await Settings.find({ guildID: userGuildIDs });
		//Add fields to show admin level, if bot is in each guild or not, as well as passing through settings. 
		const userGuildsMapped = userGuilds.reduce((reduction, guild) => {
			const adminLevel = (guild.permissions_new & 0x00000008) == 0x00000008 ? 'admin' : ((guild.permissions_new & 0x00000020) == 0x00000020 ? 'manage' : 'user');
			const isBotInServer = botGuilds.find(botGuild => botGuild.guildID == guild.id);
			
			if (isBotInServer || (adminLevel != 'user' && !isBotInServer)) {
				reduction.push({
					...guild,
					adminLevel,
					isBotInServer: isBotInServer ? true : false,
					settings: isBotInServer
				});
			} 
			
			return reduction;
		}, []);

		if (user) {
			return response.send(userGuildsMapped);
		} else {
			return response.status(401).send({ message: 'Unauthorized' });
		}
	} catch (err) {
		return response.status(401).send({ message: 'Unauthorized' });
	}
});

//Returns all movies for a given guild
router.get('/movies/:guildID', async (request, response) => {
	const user = await User.findOne({ discordID: request.user.discordID }); //Update with refresh tokens
	const { guildID } = request.params;
	const userInGuild = isUserInGuild(user, guildID); //Check if user requesting is actually in the guild

	if (userInGuild) {
		const movies = await Movies.find({ guildID },
			{
				_id: 0,
				primaryKey: 0,
				__v: 0
			}); //Excluding these fields

		return response.send(movies);
	} else {
		return response.status(401).send({ message: 'User is not in the guild.' });
	}
});

//Export to CSV
router.get('/movies-csv/:guildID', async (request, response) => {
	const user = await User.findOne({ discordID: request.user.discordID }); //Update with refresh tokens
	const { guildID } = request.params;
	const userInGuild = isUserInGuild(user, guildID); //Check if user requesting is actually in the guild

	if (userInGuild) {
		const movies = await Movies.find({ guildID },
			{
				_id: 0,
				primaryKey: 0,
				movieID: 0,
				__v: 0
			}); //Excluding these fields

		const fields = ['imdbID', 'name', 'posterURL', 'overview', 'releaseDate', 'runtime', 'rating', 'submittedBy', 'submitted', 'viewed', 'viewedDate'];
		const parser = new Parser({ fields });
  		const csv = parser.parse(movies);
		
		response.attachment('movies.csv');
		return response.send(csv);
	} else {
		return response.status(401).send({ message: 'User is not in the guild.' });
	}
});

//Deletes a movie from the guilds list. Requires GuildID and MovieID to be sent in payload. 
router.post('/movies/delete', async (request, response) => {
	const userID = request.user.discordID;
	const user = await User.findOne({ discordID: userID }); //Update with refresh tokens
	const guildID = request.body.guildID;
	const movieID = request.body.movieID;

	//Invalid POST
	if (!userID || !guildID || !user) {
		return response.status(401).send({ message: 'Incorrect Details Provided.' });
	}

	const movie = await Movies.findOne({ guildID, movieID });

	if (movie && hasDeletePermissions(user, guildID, movie)) {
		return movie.remove((err) => {
			if (!err) {
				return response.status(200).send({ success: true, message: 'Movie has been deleted.' });
			} else {
				console.log(err);

				return response.status(500).send({ success: false, message: 'Something went wrong!' });
			}
		});
	} else {
		return response.status(403).send({ success: false, message: 'User does not have permissions to delete the movie from the guild.' });
	}
	
});

//Updates a movie to be either VIEWED or UNVIEWED. Requires GuildID and MovieID to be sent in payload. 
router.post('/movies/viewed', async (request, response) => {
	const userID = request.user.discordID;
	const user = await User.findOne({ discordID: userID }); //Update with refresh tokens
	const guildID = request.body.guildID;
	const movieID = request.body.movieID;

	if (!userID || !guildID || !user) {
		return response.status(401).send({ message: 'Incorrect Details Provided.' });
	}

	const movie = await Movies.findOne({ guildID, movieID });

	if (movie && hasDeletePermissions(user, guildID, movie)) {
		return movie.updateOne({ viewed: !movie.viewed, viewedDate: movie.viewed ? null : new Date() }, (err) => {
			if (!err) {
				return response.status(200).send({ success: true, message: `Movie has been set to ${!movie.viewed ? 'viewed' : 'unviewed'}.`, viewed: !movie.viewed });
			} else {
				return response.status(500).send({ success: false, message: 'Something went wrong!', viewed: movie.viewed });
			}
		});
	} else {
		return response.status(403).send({ success: false, message: 'User does not have permissions to update the movies status.' });
	}	
});

module.exports = router;