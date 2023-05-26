const { Events } = require('discord.js');
const { Movie, Poll, Setting } = require("../../Models/schema");

module.exports = {
	name: Events.GuildDelete,
	async execute(guild) {
		// If premium, keep.
		//Whenever the bot is removed from a guild, we remove all related data.
		Poll.deleteMany({ guildID: guild.id }).catch(handleError);
		Movie.deleteMany({ guildID: guild.id }).catch(handleError);
		Setting.deleteMany({ guildID: guild.id }).catch(handleError); 
	},
};

function handleError(err, message) {
	if (err) {
		console.error(message, err);
	}
}