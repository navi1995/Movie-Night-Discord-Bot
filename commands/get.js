const { MessageEmbed } = require('discord.js');
const moment = require("moment");

module.exports = {
	name: 'get',
	description: 'Returns list of all movies in current watch list for server, or if search is specified it will attempt to search the servers list for the movie.',
	aliases: ['list', 'getmovie'],
	execute(message, args, main) {
		var embeddedMessages = [];
		var number = 1;
		var description = "";
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
		var movieEmbed = new MessageEmbed().setTitle("Submitted Movies");

		if (!args.length) {
			//2048 limit
			return main.movieModel.find(searchOptions, function (error, docs) {
				if (docs.length == 0) return message.channel.send("List of unviewed movies is currently empty.");
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

						description += stringConcat
						number++;
					}
				}

				movieEmbed.setDescription(description);
				embeddedMessages.push(movieEmbed);

				for (var embeddedMessage of embeddedMessages) {
					message.channel.send(embeddedMessage);
				}
			});
		}

		var movie = args.join(" ");
		searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

		//25 embed limit for fields
		return main.movieModel.findOne(searchOptions, function (error, movie) {
			if (movie) {
				message.channel.send(main.buildSingleMovieEmbed(movie));		
			}
		});
	},
};