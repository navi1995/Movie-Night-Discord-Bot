const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
	name: "get",
	description: "Returns list of all movies in current watch list for server, or if search is specified it will attempt to search the servers list for the movie.",
	aliases: ["list", "getmovie"],
	execute(message, args, main) {
		var embeddedMessages = [];
		var number = 1;
		var description = "";
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
		var movieEmbed = new MessageEmbed().setTitle("Submitted Movies").setColor("#6441a3");
		var movie = args ? args.join(" ") : null;

		if (!args.length) {
			//return to avoid hitting logic below.
			return main.movieModel.find(searchOptions, function (error, movies) {
				if (error) {
					message.channel.send("Could not return list of movies, an error occured.");

					return;
				}
				
				if (movies.length == 0) { 
					message.channel.send("List of unviewed movies is currently empty.");

					return;
				} else if (movies && movies.length > 0) {
					for (var movie of movies) {
						var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							movieEmbed.setDescription(description);
							embeddedMessages.push(movieEmbed);
							description = "";
							movieEmbed = new MessageEmbed().setTitle("Submitted Movies (Cont...)").setColor("#6441a3");
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

				return;
			}).lean();
		}

		searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

		//25 embed limit for fields
		return main.movieModel.findOne(searchOptions, function (error, movie) {
			if (movie) {
				message.channel.send(main.buildSingleMovieEmbed(movie));		
			} else {
				message.channel.send("Could not find movie in your list. Perhaps try using the search command instead?");
			}

			return;
		}).lean();
	},
};