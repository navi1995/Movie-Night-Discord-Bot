const emojis = require("../emojis.json");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("removeviewed")
		.setDescription("Remove all VIEWED movies from servers list if no movie specified or remove specific movie.")
		.addStringOption((option) => option.setName("movie").setDescription("Movie name or IMDB link of movie to remove from list of VIEWED movies.")),
	async execute(interaction, main, settings) {
		const movieSearch = interaction.options.getString("movie");

		if (!movieSearch) {
			if (!interaction.member.permissions.has("Administrator")) return await interaction.editReply("Sorry, only Administrators can delete all viewed movies.");

			return interaction.editReply("Are you sure you want to remove all viewed movies?").then(async () => {
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
							return main.movieModel
								.deleteMany({ guildID: interaction.guild.id, viewed: true })
								.then(async () => {
									return await interaction.followUp("All movies have been deleted.");
								})
								.catch(async () => {
									return await interaction.followUp("An error occured while trying to delete all movies");
								});
						} else {
							return await interaction.followUp("No movies have been deleted.");
						}
					})
					.catch(async () => {
						return await interaction.followUp("Couldn't get your response.");
					});
			});
		}

		const searchOptions = main.searchMovieDatabaseObject(interaction.guild.id, movieSearch);
		searchOptions.viewed = true;

		//If submitted film is by member trying to delete, allow it.
		if (movieSearch) {
			return main.movieModel
				.findOne(searchOptions)
				.then(async (movie) => {
					if (!movie) {
						return await interaction.editReply("Movie could not be found! It may be in the viewed list. Use remove command instead.");
					} else if (
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
										return movie
											.deleteOne()
											.then(async () => {
												return await interaction.followUp(`Movie deleted: ${movie.name}`);
											})
											.catch(async () => {
												return await interaction.followUp("Could not remove movie, something went wrong.");
											});
									} else {
										return await interaction.followUp(`${movie.name} has not been deleted.`);
									}
								})
								.catch(async (err) => {
									console.log(movie);
									console.log(err);
									return await interaction.followUp("Couldn't get your response.");
								});
						});
					} else {
						return await interaction.editReply("Non-administrators can only delete movies they have submitted, unless deleterole has been set to all or a specific role.");
					}
				})
				.catch(async () => {
					return await interaction.editReply("Movie could not be found! It may be in the viewed list. Use remove command instead.");
				});
		} else {
			return await interaction.editReply("Specify a movie or remove space.");
		}
	},
};
