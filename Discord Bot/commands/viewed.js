const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const moment = require("moment");

module.exports = {
	data: new SlashCommandBuilder().setName("viewedlist").setDescription("Returns list of all movies that have been marked as viewed for server."),
	execute(interaction, main) {
		let embeddedMessages = [];
		let number = 1;
		let description = "";
		let searchOptions = main.searchMovieDatabaseObject(interaction.guild.id, "");
		let movieEmbed = new EmbedBuilder().setTitle("Viewed Movies").setColor("#6441a3");

		searchOptions.viewed = true;

		//2048 limit
		return main.movieModel
			.find(searchOptions)
			.then(async (docs) => {
				if (!docs || !docs.length) {
					return await interaction.editReply("List of viewed movies is currently empty.");
				}

				for (let movie of docs) {
					const stringConcat = `**[${number++}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy}, viewed on ${moment(movie.viewedDate).format("DD MMM YYYY")}\n
				**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

					//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
					if (description.length + stringConcat.length > 2048) {
						movieEmbed.setDescription(description);
						embeddedMessages.push(movieEmbed);
						description = "";
						movieEmbed = new EmbedBuilder().setTitle("Viewed Movies (Cont...)").setColor("#6441a3");
					}

					description += stringConcat;
				}

				movieEmbed.setDescription(description);
				embeddedMessages.push(movieEmbed);

				let messagesCount = 0;

				for (let embeddedMessage of embeddedMessages) {
					messagesCount == 0 ? await interaction.editReply({ embeds: [embeddedMessage] }) : await interaction.followUp({ embeds: [embeddedMessage] });
					messagesCount++;
				}

				return;
			})
			.catch(async () => {
				return await interaction.editReply("Something went wrong trying to find the movies");
			});
	},
};
