const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	name: "poll",
	description: "Begins a poll.",
	aliases: ["begin", "start"],
	admin: true,
	async execute(message, args, main, callback, settings) {
		var embeddedMessages = [];
		var number = 1;
		var totalCount = 0;
		var description = "";
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
		var movieEmbed = new MessageEmbed().setTitle("Poll has begun!").setColor("#6441a3");
		var movieMap = {};

		message.channel.send(settings.pollTime >= 10800*1000 ? settings.pollMessage + "\n (PLEASE NOTE, POLL TIME IS CURRENTLY BEING LIMITED TO TWO HOURS DUE TO A TECHNICAL ISSUE. THIS WILL BE FIXED SOON)" : settings.pollMessage);

		//2048 limit
		await main.movieModel.find(searchOptions, function (error, docs) {
			if (error) {
				message.channel.send("Could not  return list of movies, an error occured.");

				return callback();
			}
			
			if (docs.length == 0) {
				message.channel.send("Cannot start poll. List of unviewed movies is empty.");

				return callback();
			} else if (docs && docs.length > 0) {
				//Gets random assortment of movies depending on poll size setting and number of movies in the servers list.
				var movies = main.getRandomFromArray(docs, settings.pollSize);

				totalCount = movies.length;

				for (var movie of movies) {
					var stringConcat = `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
					**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

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
					var emojiMap = {};

					message.channel.send(embeddedMessage).then(async (message) => {
						var collector = message.createReactionCollector(m => m, { time: (settings.pollTime >= 10800*1000 ? 10800*1000 : settings.pollTime) + (totalCount * 1000) }); //Add one second per option of react (takes 1 second for each react to be sent to Discord)

						console.log("Poll started" + message.guild.id);
						collector.on("collect", (messageReact, user) => {
							console.log("Collect");
							if (user.id != main.client.user.id) {
								var duplicateReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id) && reaction.emoji.name != messageReact.emoji.name);
			
								//We remove any previous reactions user has added, to ensure the latest vote remains and user can only vote for once movie.
								//This block of code exists before the reactions are added to ensure as the bot adds reactions to the message, users are not able to duplicate votes during this time.
								for (var reaction of duplicateReactions.values()) {
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
				
						collector.on("end", m => {
							console.log("Poll end" + message.guild.id);
							//Check for ties in future version.
							var highestValidReactions = m.filter(function(a) {
								return emojiMap[a.emoji.name];
							});
							var highestReact = highestValidReactions.reduce((p, c) => p.count > c.count ? p : c, 0);

							console.log(highestReact);
							if (!highestReact.emoji) {
								message.channel.send("Bot could not collect reactions. Please ensure the bot has permissions in this channel to ADD REACTIONS and MANAGE MESSAGES.");

								return callback();
							}

							var winner = movieMap[emojiMap[highestReact.emoji.name]];

							if (highestReact.count <= 1) {
								message.channel.send("No votes were cast, so no movie has been chosen.");
								
								return callback();
							}
							
							//If auto viewed is set, update movie to be entered into the VIEWED list. 
							if (settings.autoViewed) {
								main.movieModel.updateOne({ guildID: message.guild.id, movieID: winner.movieID }, { viewed: true, viewedDate: new Date() }, function(err) {
									if (!err) {
										winner.viewed = true; winner.viewedDate = new Date();
										message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
									} else {
										message.channel.send("Something went wrong, could not get winner. Try removing auto-view setting.");
									}

									return callback();
								});
							} else {
								message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));

								return callback();
							}
						});
					});
				}
			}
		}).lean();
	},
};