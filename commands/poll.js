const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	name: "poll",
	description: "Begins a poll.",
	aliases: ["begin", "start"],
	admin: true,
	async execute(message, args, main) {
		var embeddedMessages = [];
		var number = 1;
		var totalCount = 0;
		var description = "";
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
		var movieEmbed = new MessageEmbed().setTitle("Poll has begun!").setColor("#6441a3");
		var movieMap = {};
		var settings = main.guildSettings.get(message.guild.id);

		message.channel.send(settings.pollMessage);

		//2048 limit
		await main.movieModel.find(searchOptions, function (error, docs) {
			if (error) {
				return message.channel.send("Could not  return list of movies, an error occured.");
			}
			
			if (docs.length == 0) {
				return message.channel.send("Cannot start poll. List of unviewed movies is empty.");
			} else if (docs && docs.length > 0) {
				//Gets random assortment of movies depending on poll size setting and number of movies in the servers list.
				var movies = main.getRandomFromArray(docs, settings.pollSize);

				totalCount = movies.length;

				for (var movie of movies) {
					var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
					**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;

					//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
					if (description.length + stringConcat.length > 2048) {
						movieEmbed.setDescription(description);
						embeddedMessages.push(movieEmbed);
						description = "";
						movieEmbed = new MessageEmbed().setTitle("Poll has begun! (Cont...)").setColor("#6441a3");
					} 

					description += stringConcat;
					movieMap[number] = movie; //Store position of movie in list.
					number++;		
				}
			}

			movieEmbed.setDescription(description);
			embeddedMessages.push(movieEmbed);

			for (var i = 0; i < embeddedMessages.length; i++) {
				var embeddedMessage = embeddedMessages[i];

				//If the message is NOT the last one in the embedded messages chain, just send the message. ELSE we wil be sending the message + handling reacts on it.
				if (i != embeddedMessages.length - 1) {
					message.channel.send(embeddedMessage);
				} else {
					const filter = m => m;
					var emojiMap = {};

					message.channel.send(embeddedMessage).then(async (message) => {
						const collector = message.createReactionCollector(filter, { time: settings.pollTime + (totalCount * 1000) }); //Add one second per option of react (takes 1 second for each react to be sent to Discord)

						await collector.on("collect", (messageReact, user) => {
							if (user.id != main.client.user.id) {
								const duplicateReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id) && reaction.emoji.name != messageReact.emoji.name);
			
								//We remove any previous reactions user has added, to ensure the latest vote remains and user can only vote for once movie.
								//This block of code exists before the reactions are added to ensure as the bot adds reactions to the message, users are not able to duplicate votes during this time.
								for (const reaction of duplicateReactions.values()) {
									try {
										reaction.users.remove(user.id);
									} catch (e) {
										console.error("Error removing reaction", e);
									}
								}
							}
						});

						for (var i = 1; i <= totalCount; i++) {
							emojiMap[emojis[i]] = i;
							await message.react(emojis[i]);
						}
				
						await collector.on("end", m => {
							//Check for ties in future version.
							const highestReact = m.reduce((p, c) => p.count > c.count ? p : c, 0);
							var winner = movieMap[emojiMap[highestReact.emoji.name]];

							if (highestReact.count == 1) {
								return message.channel.send("No votes were cast, so no movie has been chosen.");
							}

							//If auto viewed is set, update movie to be entered into the VIEWED list. 
							if (settings.autoViewed) {
								main.movieModel.updateOne({ guildID: message.guild.id, movieID: winner.movieID }, { viewed: true, viewedDate: new Date() }, function(err) {
									if (!err) {
										winner.viewed = true; winner.viewedDate = new Date();

										return message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
									} else {
										return message.channel.send("Something went wrong, could not get winner. Try removing auto-view setting.");
									}
								});
							} else {
								return message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
							}
						});
					});
				}
			}
		});
	},
};