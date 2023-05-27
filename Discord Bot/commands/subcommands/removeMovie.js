const emojis = require("../../emojis.json");
const { Movie } = require("../../../Models/schema");
const { movieSearchOptionsForDb } = require("../../helpers/helperFunctions");

async function removeMovie(interaction, settings) {
	const movieSearch = interaction.options.getString("search");
	const searchOptions = movieSearchOptionsForDb(interaction.guild.id, movieSearch, true);

	//If submitted film is by member trying to delete, allow it.
	if (movieSearch) {
		return Movie
			.findOne(searchOptions)
			.then(async (movie) => {
				if (
					"<@" + interaction.member.user.id + ">" === movie.submittedBy ||
					(settings.deleteMoviesRole && (interaction.member.roles.cache.has(settings.deleteMoviesRole) || settings.deleteMoviesRole == "all")) ||
					interaction.member.permissions.has("Administrator")
				) {
					return await interaction.editReply(`Are you sure you want to delete ${movie.name}?`).then(async () => {
						const botMessage = await interaction.fetchReply();
						const filter = (reaction, user) => [emojis.yes, emojis.no].includes(reaction.emoji.name) && user.id == interaction.member.id;

						try {
							await botMessage.react(emojis.yes);
							await botMessage.react(emojis.no);
						} catch (e) {
							console.log("Message deleted");
						}

						//Wait for user to confirm if movie presented to them is what they wish to be added to the list or not.
						return botMessage
							.awaitReactions({ filter: filter, max: 1, time: 15000, errors: ["time"] })
							.then(async (collected) => {
								const reaction = collected.first();

								if (reaction.emoji.name == emojis.yes) {
									await movie.deleteOne();

									return await interaction.followUp(`Movie deleted: ${movie.name}`);
								} else {
									return await interaction.followUp(`${movie.name} has not been deleted.`);
								}
							})
							.catch(async () => {
								return await interaction.followUp("Couldn't get your response.");
							});
					});
				} else {
					return await interaction.editReply("Non-administrators can only delete movies they have submitted, unless deleterole has been set to all or a specific role.");
				}
			})
			.catch(async () => {
				return await interaction.editReply("Movie could not be found! It may be in the viewed list. Use removeviewed instead.");
			});
	} else {
		return await interaction.editReply("Specify a movie or remove space.");
	}
}

module.exports = removeMovie;