const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("search")
		.setDescription("Gets details for a movie without adding to servers list.")
		.addStringOption((option) => option.setName("movie").setDescription("Movie name or IMDB link of movie to search for.").setRequired(true)),
	async execute(interaction, main) {
		const movieSearch = interaction.options.getString("movie");

		return main.searchNewMovie(movieSearch, interaction).then(async ([newMovie]) => {
			//No need for else, searchNewMovie alerts user if no movie found.
			if (newMovie) {
				return await interaction.editReply({ embeds: [main.buildSingleMovieEmbed(newMovie, "Movie Details (Not Added)", true)] });
			}
		}).catch(async err => {
			console.error("Search.js", err);
			return await interaction.editReply("Something went wrong.");
		});
	}	
};