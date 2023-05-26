const { Movie } = require("../../../Models/schema");
const { movieSearchOptionsForDb, buildAndPostListEmbed } = require("../../helpers/helperFunctions");

async function postViewedList (interaction) {
	let searchOptions = movieSearchOptionsForDb(interaction.guild.id, "");

	searchOptions.viewed = true;
	
	const movies = await Movie.find(searchOptions);

	if (!movies || !movies.length) {
		return await interaction.editReply("List of viewed movies is currently empty.");
	} else {
		return await buildAndPostListEmbed(movies, "Viewed Movies", interaction);
	}
}

module.exports = postViewedList;
