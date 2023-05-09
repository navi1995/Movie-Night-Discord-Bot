const { SlashCommandBuilder } = require("discord.js");
const emojis = require("../emojis.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add")
		.setDescription("Adds movie to the servers list for movies to vote on and view.")
		.addStringOption((option) => option.setName("moviename").setDescription("Movie to search for to add to unviewed list. Able to use IMDB link.").setRequired(true)),
	async execute(interaction, main, settings) {
		const search = interaction.options.getString("moviename");

		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set.
		if (settings.addMoviesRole && !interaction.member.roles.cache.has(settings.addMoviesRole) && !interaction.member.permissions.has("ADMINISTRATOR")) {
			return await interaction.editReply("Non-administrators can only add movies if they have specified role in addMoviesRole has cleared or a specific role by an administrator.");
		}

		//Continue with normal search if the above doesnt return.
		try {
			return main.searchNewMovie(search, interaction).then(([newMovie, data]) => {
				//No need for else, searchNewMovie alerts user if no movie found.
				if (newMovie) {
					return newMovie
						.save()
						.then(async () => {
							//If the search results from the API returned more than one result, we ask the user to confirm using REACTIONS on the message.
							if (data && (data.total_results > 1 || (data.movie_results && data.movie_results.length > 1))) {
								const movieEmbed = main.buildSingleMovieEmbed(newMovie, "Is this the movie you want to add?");

								return await interaction.editReply({ embeds: [movieEmbed] }).then(async () => {
									const embedMessage = await interaction.fetchReply();
									const filter = (reaction, user) => [emojis.yes, emojis.no].includes(reaction.emoji.name) && user.id == interaction.member.id;

									try {
										await embedMessage.react(emojis.yes);
										await embedMessage.react(emojis.no);
									} catch (e) {
										console.log("Message deleted");
										console.error(e);

										return newMovie.deleteOne().catch(() => {});
									}

									//Wait for user to confirm if movie presented to them is what they wish to be added to the list or not.
									return embedMessage
										.awaitReactions({ filter: filter, max: 1, time: 15000, errors: ["time"] })
										.then(async (collected) => {
											const reaction = collected.first();

											if (reaction.emoji.name == emojis.yes) {
												return interaction.followUp("Movie will be added to the list!");
											} else {
												await interaction.followUp("Movie will not be added to the list. Try using an IMDB link instead?");

												return newMovie.deleteOne().catch(() => {});
											}
										})
										.catch(async (e) => {
											console.log(e);
											await interaction.followUp("Movie will not be added, you didn't respond in time. Try using an IMDB link instead?");

											return newMovie.deleteOne().catch(() => {});
										});
								});
							} else {
								return await interaction.editReply({ embeds: [main.buildSingleMovieEmbed(newMovie, "Movie Added!")] });
							}
						})
						.catch(async (err) => {
							if (err && err.name == "MongoServerError") {
								return await interaction.editReply("Movie already exists in the list. It may be marked as 'Viewed'");
							} else if (err) {
								console.log(err);
								return await interaction.editReply("Something went wrong, couldn't run command");
							}
						});
				}
			});
		} catch (e) {
			console.error("Add.js", e);

			return interaction.editReply("Something went wrong.");
		}
	},
};
