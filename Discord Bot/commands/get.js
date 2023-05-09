const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const moment = require("moment");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("getmovie_s")
		.setDescription("Returns list of all movies in current unviewed list for server, or search using text.")
		.addStringOption((option) => option.setName("search").setDescription("Movie to search for, Able to use IMDB link.")),
	async execute(interaction, main) {
		const search = interaction.options.getString("search");
		let embeddedMessages = [];
		let number = 1;
		let description = "";
		let searchOptions = main.searchMovieDatabaseObject(interaction.guild.id, "", true);
		let movieEmbed = new EmbedBuilder().setTitle("Submitted Movies").setColor("#6441a3");

		if (!search || !search.length) {
			//return to avoid hitting logic below.
			return main.movieModel
				.find(searchOptions)
				.then(async (movies) => {
					if (!movies || !movies.length) {
						return await interaction.editReply("List of unviewed movies is currently empty.");
					} else {
						for (let movie of movies) {
							let stringConcat = `**[${number++}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

							//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
							if (description.length + stringConcat.length > 2048) {
								movieEmbed.setDescription(description);
								embeddedMessages.push(movieEmbed);
								description = "";
								movieEmbed = new EmbedBuilder().setTitle("Submitted Movies (Cont...)").setColor("#6441a3");
							}

							description += stringConcat;
						}
					}

					movieEmbed.setDescription(description);
					embeddedMessages.push(movieEmbed);

					let messagesCount = 0;

					for (let embeddedMessage of embeddedMessages) {
						messagesCount == 0 ? await interaction.editReply({ embeds: [embeddedMessage] }) : await interaction.followUp({ embeds: [embeddedMessage] });
						messagesCount++;
					}
				})
				.catch(async () => {
					return await interaction.editReply("Could not return list of movies, an error occured.");
				});
		}

		searchOptions = main.searchMovieDatabaseObject(interaction.guild.id, search || null);

		//25 embed limit for fields
		return main.movieModel
			.findOne(searchOptions)
			.then(async (movie) => {
				return await interaction.editReply({ embeds: [main.buildSingleMovieEmbed(movie)] });
			})
			.catch(async () => {
				return await interaction.editReply("Could not find movie in your list. Perhaps try using the search command instead?");
			});
	},
};
