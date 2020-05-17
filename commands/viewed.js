const { MessageEmbed } = require('discord.js');
const moment = require("moment");

module.exports = {
	name: 'viewed',
	description: 'Returns list of all movies that have been marked as viewed for server.',
	aliases: ['getviewed', 'viewedlist'],
	execute(message, args, main) {
		var embeddedMessages = [];
		var number = 1;
		var description = "";
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "");
		var movieEmbed = new MessageEmbed().setTitle("Submitted Movies");

		searchOptions.viewed = true;

		//2048 limit
		return main.movieModel.find(searchOptions, function (error, docs) {
			console.log(docs);
			if (docs && docs.length > 0) {
				for (var movie of docs) {
					var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
					**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;

					if (description.length + stringConcat.length > 2048) {
						movieEmbed.setDescription(description);
						embeddedMessages.push(movieEmbed);
						description = "";
						movieEmbed = new MessageEmbed().setTitle("Submitted Movies (Cont...)");
					} 

					description += stringConcat;
					number++;
				}
			}

			movieEmbed.setDescription(description);
			embeddedMessages.push(movieEmbed);

			for (var embeddedMessage of embeddedMessages) {
				message.channel.send(embeddedMessage);
			}
		});
	},
};