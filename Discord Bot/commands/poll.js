const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("Begins a poll with a random assortment of movies depending on length of setting for poll size.")
		.addIntegerOption((option) => option.setName("size").setDescription("Number of movies included in the poll. Max is 10"))
		.addStringOption((option) => option.setName("message").setDescription("Sets the message that will be sent for the poll."))
		.addIntegerOption((option) => option.setName("time").setDescription("How long in seconds the poll will last. Max poll times may be in effect to help server load."))
		.addStringOption((option) =>
			option.setName("multiplevotes").setDescription("Whether or not votes for multiple options are allowed or not.").addChoices({ name: "Enforce one vote per member", value: "disallow" }, { name: "Allow Multiple", value: "allow" })
		),
	async execute(interaction, main, settings) {
		let embeddedMessages = [];
		const voteMenuOptions = [];
		let votes = {};
		let totalCount = 0;
		let description = "";
		let searchOptions = main.searchMovieDatabaseObject(interaction.guild.id, "", true); //["300", "Interstellar", "Tissue"], true);//"", true);
		let movieEmbed = new EmbedBuilder().setTitle("Poll has begun!").setColor("#6441a3");
		let movieArray = [];
		const pollSize = (interaction.options.getInteger("size") || 5) <= 10 ? interaction.options.getInteger("size") || 5 : 10;
		const pollTimeInMs = ((interaction.options.getInteger("time") || 60000) <= main.maxPollTime ? interaction.options.getInteger("time") || 60000 : main.maxPollTime) * 1000;
		const pollAnnounceMessage = interaction.options.getString("message") || "Poll has begun!";
		const multipleVotes = interaction.options.getString("multiplevotes") || "disallow";
		//Check this logic
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set.
		if (!interaction.member.permissions.has("Administrator") && settings.pollRole != "all" && (!settings.pollRole || !interaction.member.roles.cache.has(settings.pollRole))) {
			return await interaction.editReply(`Polls can only be started by administrators or users with the ${settings.pollRole ? `role <@&${settings.pollRole}>` : "a set role using the `pollrole` command."}`);
		}

		await interaction.editReply(
			pollTimeInMs >= main.maxPollTime * 1000
				? pollAnnounceMessage +
						`\n (PLEASE NOTE, POLL TIME IS CURRENTLY BEING LIMITED TO ${secondsToHms(main.maxPollTime)} DUE TO SERVER COSTS AND ISSUES. Developers are constantly trying to increase this while also trying to keep server stability.)`
				: pollAnnounceMessage,
			{ allowedMentions: {} }
		);

		//2048 limit
		await main.movieModel
			.find(searchOptions)
			.then(async (docs) => {
				if (!docs.length) {
					return await interaction.followUp("Cannot start poll. List of unviewed movies is empty.");
				} else if (docs && docs.length) {
					//Gets random assortment of movies depending on poll size setting and number of movies in the servers list.
					let movies = main.getRandomFromArray(docs, pollSize);

					totalCount = movies.length;

					for (let movie of movies) {
						let stringConcat = `**[${emojis[movieArray.length + 1]} ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;
						voteMenuOptions.push(
							new ButtonBuilder()
								.setLabel("0")
								.setCustomId(`${movieArray.length + 1}`)
								.setStyle(ButtonStyle.Secondary)
								.setEmoji(emojis[movieArray.length + 1])
						);
						votes[movieArray.length + 1] = { voters: [], movieID: movie.movieID, movieName: movie.name };
						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							movieEmbed.setDescription(description);
							embeddedMessages.push(movieEmbed);
							description = "";
							movieEmbed = new EmbedBuilder().setTitle("Poll has begun! (Cont...)").setColor("#6441a3");
						}

						description += stringConcat;
						movieArray.push(movie); //Store position of movie in list.
					}
				}

				movieEmbed.setDescription(description);
				embeddedMessages.push(movieEmbed);

				for (let i = 0; i < embeddedMessages.length; i++) {
					let embeddedMessage = embeddedMessages[i];

					if (i != embeddedMessages.length - 1) {
						await interaction.followUp({ embeds: [embeddedMessage] });
					} else {
						// This needs to be an array if > 5 options
						const row1 = new ActionRowBuilder().addComponents(voteMenuOptions.slice(0, 5));
						const components = [row1];

						if (voteMenuOptions.slice(5, 10).length != 0){
							components.push(new ActionRowBuilder().addComponents(voteMenuOptions.slice(5, 10)))
						}

						let pollMessage = await interaction.followUp({ 
							embeds: [embeddedMessage], 
							components: components
						});

						await main.pollModel.create({
							guildID: interaction.guildId,
							messageID: pollMessage.id,
							channelID: pollMessage.channelId,
							votes: votes,
							endDateTime: moment().add(pollTimeInMs, 'ms'),
							ended: false,
							allowMultipleVotes: multipleVotes == "allow"
						});

						// 	collector.on("end", async () => {
						// 		console.log("Poll end.  GuildID: " + message.guild.id + " " + new Date());
						// 		//Refetch message due to discord.js caching.
						// 		await message
						// 			.fetch()
						// 			.then(async (updatedMessage) => {
						// 				const highestReact = highestValidReactions.reduce((p, c) => (p.count > c.count ? p : c));

						// 				if (!highestReact || !highestReact.emoji) {
						// 					console.error("Could not collect reactions");
						// 					console.error(emojiArray);
						// 					console.error(highestReact);
						// 					console.error(highestValidReactions);
						// 					if (highestReact) console.error(highestReact.emoji);
						// 					return await interaction.followUp("Bot could not collect reactions. Please ensure the bot has permissions in this channel to ADD REACTIONS and MANAGE MESSAGES.");
						// 				}

						// 				let winner = movieArray[emojiArray.indexOf(highestReact.emoji.name)];

						// 				if (highestReact.count <= 1) {
						// 					return await interaction.followUp("No votes were cast, so no movie has been chosen.");
						// 				}

						// 				//If auto viewed is set, update movie to be entered into the VIEWED list.
						// 				if (settings.autoViewed) {
						// 					await main.movieModel
						// 						.updateOne({ guildID: message.guild.id, movieID: winner.movieID }, { viewed: true, viewedDate: new Date() })
						// 						.then(async () => {
						// 							winner.viewed = true;
						// 							winner.viewedDate = new Date();
						// 						})
						// 						.catch(async () => {
						// 							return await interaction.followUp("Something went wrong, could not get winner. Try removing auto-view setting.");
						// 						});
						// 				}

						// 				return await interaction.followUp({ embeds: [main.buildSingleMovieEmbed(winner, `A winner has been chosen! ${winner.name} with ${highestReact.count - 1} votes.`)] });
						// 			})
						// 			.catch(function () {
						// 				console.log(`Poll was deleted. guild: ${message.guild.id}, channel: ${message.channel.id}, message ID: ${message.id}`);
						// 			});
						// 	});
						// });
					}
				}
			})
			.catch(async (err) => {
				console.log(err);
				return await interaction.followUp("Could not  return list of movies, an error occured.");
			});
	},
};

function secondsToHms(d) {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor((d % 3600) / 60);
	var s = Math.floor((d % 3600) % 60);

	var hDisplay = h > 0 ? h + (h == 1 ? " hour" : " hours") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return [hDisplay, mDisplay, sDisplay].filter(Boolean).join(", ");
}
