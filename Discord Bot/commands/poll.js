const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	name: "poll",
	description: "Begins a poll.",
	aliases: ["begin", "start"],
	//admin: true, Check admin but also check setting for pollRole
	async execute(message, args, main, settings) {
		let embeddedMessages = [];
		let totalCount = 0;
		let description = "";
		let searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
		let movieEmbed = new MessageEmbed().setTitle("Poll has begun!").setColor("#6441a3");
		let movieArray = [];

		//Check this logic
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		if (!message.member.hasPermission("ADMINISTRATOR") && (!settings.pollRole || !message.member.roles.cache.has(settings.pollRole))) {
			return message.channel.send(`Polls can only be started by administrators or users with the ${settings.pollRole ? `role <@&${settings.pollRole}>` : 'a set role using the `pollrole` command.'}`);
		}

		await message.channel.send(settings.pollTime >= main.maxPollTime*1000 ? settings.pollMessage + `\n (PLEASE NOTE, POLL TIME IS CURRENTLY BEING LIMITED TO ${secondsToHms(main.maxPollTime)} DUE TO SERVER COSTS AND ISSUES. Developers are constantly trying to increase this while also trying to keep server stability.)` : settings.pollMessage, { allowedMentions: {} });

		//2048 limit
		await main.movieModel.find(searchOptions, async (error, docs) => {
			if (error) {
				return message.channel.send("Could not  return list of movies, an error occured.");
			}
			
			if (!docs.length) {
				return message.channel.send("Cannot start poll. List of unviewed movies is empty.");
			} else if (docs && docs.length) {
				//Gets random assortment of movies depending on poll size setting and number of movies in the servers list.
				let movies = main.getRandomFromArray(docs, settings.pollSize);

				totalCount = movies.length;

				for (let movie of movies) {
					let stringConcat = `**[${emojis[movieArray.length + 1]} ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
					**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

					//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
					if (description.length + stringConcat.length > 2048) {
						movieEmbed.setDescription(description);
						embeddedMessages.push(movieEmbed);
						description = "";
						movieEmbed = new MessageEmbed().setTitle("Poll has begun! (Cont...)").setColor("#6441a3");
					} 

					description += stringConcat;
					movieArray.push(movie); //Store position of movie in list.
				}
			}

			movieEmbed.setDescription(description);
			embeddedMessages.push(movieEmbed);

			console.log(embeddedMessages.length);
			for (let i = 0; i < embeddedMessages.length; i++) {
				let embeddedMessage = embeddedMessages[i];
				
				if (i != embeddedMessages.length - 1) {
					console.log("Hello");
					await message.channel.send(embeddedMessage);
				} else {
					let emojiArray = [];

					await message.channel.send(embeddedMessage).then(async message => {
						//Polltime is stored in ms
						let collector = message.createReactionCollector((r, u) => u.id !== main.client.user.id && emojiArray.includes(r.emoji.name), { time: (settings.pollTime >= main.maxPollTime*1000 ? main.maxPollTime*1000 : settings.pollTime) + (totalCount * 1000) }); //Add one second per option of react (takes 1 second for each react to be sent to Discord)
		
						console.log("Poll started. GuildID: " + message.guild.id  + " " + new Date());
						collector.on("collect", async (messageReact, user) => {
							console.log("Collect" + " " + new Date());
							let duplicateReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id) && reaction.emoji.name != messageReact.emoji.name);
		
							//We remove any previous reactions user has added, to ensure the latest vote remains and user can only vote for once movie.
							//This block of code exists before the reactions are added to ensure as the bot adds reactions to the message, users are not able to duplicate votes during this time.
							for (let reaction of duplicateReactions.values()) {
								try {
									await reaction.users.remove(user.id);
								} catch (e) {
									console.error("Error removing reaction", e);
								}
							}
						});
		
						for (let i = 1; i <= totalCount; i++) {
							try {
								await message.react(emojis[i]);
								emojiArray.push(emojis[i]);
							} catch (e) {
								console.log("Poll message deleted" + " " + new Date() );
								collector.stop();
							}
						}
				
						collector.on("end", async () => {
							console.log("Poll end.  GuildID: " + message.guild.id + " " + new Date());
							//Refetch message due to discord.js caching.
							await message.fetch().then(async updatedMessage => {
								const reactionsCache = updatedMessage.reactions.cache;
								const highestValidReactions = reactionsCache.filter(a => emojiArray.includes(a.emoji.name));
		
								if (!highestValidReactions.size) {
									return message.channel.send("Reactions may have been removed or another error occurred.");
								}
		
								const highestReact = highestValidReactions.reduce((p, c) => p.count > c.count ? p : c);
		
								if (!highestReact || !highestReact.emoji) {
									console.error("Could not collect reactions");
									console.error(emojiArray);
									console.error(highestReact);
									console.error(highestValidReactions);
									if (highestReact) console.error(highestReact.emoji);
									return message.channel.send("Bot could not collect reactions. Please ensure the bot has permissions in this channel to ADD REACTIONS and MANAGE MESSAGES.");
								}
		
								let winner = movieArray[emojiArray.indexOf(highestReact.emoji.name)];
		
								if (highestReact.count <= 1) {
									return message.channel.send("No votes were cast, so no movie has been chosen.");
								}
								
								//If auto viewed is set, update movie to be entered into the VIEWED list. 
								if (settings.autoViewed) {
									await main.movieModel.updateOne({ guildID: message.guild.id, movieID: winner.movieID }, { viewed: true, viewedDate: new Date() }, function(err) {
										if (!err) {
											winner.viewed = true; winner.viewedDate = new Date();
										} else {
											return message.channel.send("Something went wrong, could not get winner. Try removing auto-view setting.");
										}
									});
								}
								return message.channel.send(main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count-1} votes.`));
							}).catch(function() {
								console.log(`Poll was deleted. guild: ${message.guild.id}, channel: ${message.channel.id}, message ID: ${message.id}`);
							});
						});
					});
				}
				//If the message is NOT the last one in the embedded messages chain, just send the message. ELSE we wil be sending the message + handling reacts on it.

				
			}
		}).lean();
	},
};

function secondsToHms(d) {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);

	var hDisplay = h > 0 ? h + (h == 1 ? " hour" : " hours") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return [hDisplay, mDisplay, sDisplay].filter(Boolean).join(", "); 
}