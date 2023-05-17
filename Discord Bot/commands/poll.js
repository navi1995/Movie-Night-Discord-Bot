const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("Begins a poll with a random assortment of movies depending on length of setting for poll size.")
		.addIntegerOption((option) => option.setName("size").setDescription("Number of movies included in the poll. Max is 10"))
		.addStringOption((option) => option.setName("message").setDescription("Sets the message that will be sent for the poll."))
		.addIntegerOption((option) => option.setName("time").setDescription("How long in MINUTES the poll will last. Default is 60"))
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
		let movieCount = 0;
		const pollSize = (interaction.options.getInteger("size") || 5) <= 10 ? interaction.options.getInteger("size") || 5 : 10;
		const pollTimeInMinutes = interaction.options.getInteger("time") || 60
		const pollAnnounceMessage = interaction.options.getString("message") || "Poll has begun!";
		const multipleVotes = interaction.options.getString("multiplevotes") || "disallow";
		//Check this logic
		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set.
		if (!interaction.member.permissions.has("Administrator") && settings.pollRole != "all" && (!settings.pollRole || !interaction.member.roles.cache.has(settings.pollRole))) {
			return await interaction.editReply(`Polls can only be started by administrators or users with the ${settings.pollRole ? `role <@&${settings.pollRole}>` : "a set role using the `pollrole` command."}`);
		}

		await interaction.editReply(pollAnnounceMessage);

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
						let stringConcat = `**[${emojis[movieCount + 1]} ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;
						voteMenuOptions.push(
							new ButtonBuilder()
								.setLabel("0")
								.setCustomId(`${movieCount + 1}`)
								.setStyle(ButtonStyle.Secondary)
								.setEmoji(emojis[movieCount + 1])
						);
						votes[movieCount + 1] = { voters: [], movieID: movie.movieID, movieName: movie.name };

						//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
						if (description.length + stringConcat.length > 2048) {
							movieEmbed.setDescription(description);
							embeddedMessages.push(movieEmbed);
							description = "";
							movieEmbed = new EmbedBuilder().setTitle("Poll has begun! (Cont...)").setColor("#6441a3");
						}

						description += stringConcat;
						movieCount++; //Store position of movie in list.
					}
				}

				movieEmbed.setDescription(description);
				embeddedMessages.push(movieEmbed);

				for (let i = 0; i < embeddedMessages.length; i++) {
					let embeddedMessage = embeddedMessages[i];

					if (i != embeddedMessages.length - 1) {
						await interaction.followUp({ embeds: [embeddedMessage] });
					} else {
						const row1 = new ActionRowBuilder().addComponents(voteMenuOptions.slice(0, 5));
						const components = [row1];
						const endTime = moment().add(pollTimeInMinutes, 'm').set('ms', 0)

						if (voteMenuOptions.slice(5, 10).length != 0){
							components.push(new ActionRowBuilder().addComponents(voteMenuOptions.slice(5, 10)))
						}

						embeddedMessage.setFooter({ text: `Poll will end ${endTime.format('DD MMM YYYY HH:mm')} server time (PDT)` });

						let pollMessage = await interaction.followUp({ 
							embeds: [embeddedMessage], 
							components: components
						});

						await main.pollModel.create({
							guildID: interaction.guildId,
							messageID: pollMessage.id,
							channelID: pollMessage.channelId,
							votes: votes,
							endDateTime: moment().add(pollTimeInMinutes, 'm').set('ms', 0),
							ended: false,
							allowMultipleVotes: multipleVotes == "allow"
						});
					}
				}

				return;
			})
			.catch(async (err) => {
				console.log(err);
				return await interaction.followUp("Could not create a poll, something went wrong.");
			});
	},
};
