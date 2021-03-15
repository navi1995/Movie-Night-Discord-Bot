const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
	name: "get",
	description: "Returns list of all movies in current watch list for server, or if search is specified it will attempt to search the servers list for the movie.",
	aliases: ["list", "getmovie"],
	execute(message, args, main) {
		let embeddedMessages = [];
		let number = 1;
		let description = "";
		let searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
		let movieEmbed = new MessageEmbed().setTitle("Submitted Movies").setColor("#6441a3");

		if (!args.length) {
			//return to avoid hitting logic below.
			return main.movieModel.find(searchOptions, async (error, movies) => {
				if (error) {
					return message.channel.send("Could not return list of movies, an error occured.");
				}
				
				if (movies.length == 0 || !movies.length) { 
					return message.channel.send("List of unviewed movies is currently empty.");
				} else {
					for (let movie of movies) {
						let stringConcat = `**[${number++}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							movieEmbed.setDescription(description);
							embeddedMessages.push(movieEmbed);
							description = "";
							movieEmbed = new MessageEmbed().setTitle("Submitted Movies (Cont...)").setColor("#6441a3");
						} 

						description += stringConcat;
					}
				}

				movieEmbed.setDescription(description);
				embeddedMessages.push(movieEmbed);

				for (let embeddedMessage of embeddedMessages) {
					await message.channel.send(embeddedMessage);
				}
			}).lean();
		}

		searchOptions = main.searchMovieDatabaseObject(message.guild.id, args.join(" ") || null);

		//25 embed limit for fields
		return main.movieModel.findOne(searchOptions, (error, movie) => {
			if (movie) {
				return message.channel.send(main.buildSingleMovieEmbed(movie));		
			} else {
				return message.channel.send("Could not find movie in your list. Perhaps try using the search command instead?");
			}
		}).lean();
	},
};