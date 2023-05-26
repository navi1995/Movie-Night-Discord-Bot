const { buildSingleMovieEmbed, movieSearchOptionsForDb, searchMovieApi } = require("../../helpers/helperFunctions");
const { Movie } = require("../../../Models/schema");

async function postFoundMovie(interaction) {
	const search = interaction.options.getString("search");
	const searchOptions = movieSearchOptionsForDb(interaction.guild.id, search || null);
	const movie = await Movie.findOne(searchOptions);

	if (movie) {
		return await interaction.editReply({ embeds: [buildSingleMovieEmbed(movie)] });
	} 

	const [newMovie] = await searchMovieApi(search, interaction);

	if (newMovie) {
		return await interaction.editReply({ embeds: [buildSingleMovieEmbed(newMovie, "Movie Details (Not In Any Server List, use /add to add.)", true)] });
	}
}

module.exports = postFoundMovie;
