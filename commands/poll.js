const { MessageEmbed } = require('discord.js');
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	name: 'poll',
	description: 'Begins a poll.',
	aliases: ['begin', 'start'],
	async execute(message, args, main) {
		var embeddedMessages = [];
		var number = 1;
		var totalCount = 0;
		var description = "";
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "");
		var movieEmbed = new MessageEmbed().setTitle("Poll has begun!");
		var movieMap = {}
		var settings = main.guildSettings.get(message.guild.id);

		message.channel.send(settings.pollMessage);

		//2048 limit
		await main.movieModel.find(searchOptions, function (error, docs) {
			if (docs && docs.length > 0) {
				//Setting for poll amount
				var movies = main.getRandomFromArray(docs, 10);

				totalCount = movies.length;

				for (var movie of movies) {
					var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
					**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;

					if (description.length + stringConcat.length > 2048) {
						movieEmbed.setDescription(description);
						embeddedMessages.push(movieEmbed);
						description = "";
						movieEmbed = new MessageEmbed().setTitle("Poll has begun! (Cont...)");
					} 

					description += `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;
					movies[number-1].number = number;
					movieMap[number] = movie;
					number++;		
				}
			}

			movieEmbed.setDescription(description);
			embeddedMessages.push(movieEmbed);

			for (var i = 0; i < embeddedMessages.length; i++) {
				var embeddedMessage = embeddedMessages[i];

				if (i != embeddedMessages.length - 1) {
					message.channel.send(embeddedMessage);
				} else {
					const filter = m => m;
					var emojiMap = {};

					message.channel.send(embeddedMessage).then(async (message) => {
						const collector = message.createReactionCollector(filter, { time: settings.pollTime + (totalCount * 1000) }); //Add one second per option of react (takes 1 second for each react to be sent to Discord)

						await collector.on('collect', (messageReact, user) => {
							if (user.id != main.client.user.id) {
								console.log("REACT");
								const duplicateReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id) && reaction.emoji.name != messageReact.emoji.name);
			
								for (const reaction of duplicateReactions.values()) {
									try {
										reaction.users.remove(user.id);
									} catch (e) {
										console.log("Error removing reaction");
										console.log(e);
									}
								}
							}
						});

						for (var i = 1; i <= totalCount; i++) {
							emojiMap[emojis[i]] = i;
							await message.react(emojis[i]);
						}
				
						await collector.on('end', m => {
							const highestReact = m.reduce((p, c) => p.count > c.count ? p : c, 0);
							var winner = movieMap[emojiMap[highestReact.emoji.name]];
							//var tieCount = {};

							if (highestReact.count == 1) {
								return message.channel.send("No votes were cast, so no movie has been chosen.");
							}						
							//Check for ties

							message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));	
						});
					});
				}
			}
		});
	},
};