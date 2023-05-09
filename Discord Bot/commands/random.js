const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("random").setDescription("Returns a random movie from the servers list of films to watch. Sets to viewed if autoview is on.").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, main, settings) {
		//First we get total number of movies the guild has that are unviewed.
		return main.movieModel
			.countDocuments({ guildID: interaction.guild.id, viewed: false })
			.then(async (count) => {
				const random = Math.floor(Math.random() * count);
				const searchOptions = main.searchMovieDatabaseObject(interaction.guild.id, "", true);

				//Then using a generated random number limited to the count, we find a random movie from the guilds list. If auto view is on, it will be set to viewed.
				return main.movieModel
					.find(searchOptions)
					.skip(random)
					.limit(1)
					.exec().then(async (docs) => {
						if (docs && docs.length) {
							const movieEmbed = main.buildSingleMovieEmbed(docs[0]);

							if (settings.autoViewed) {
								return main.movieModel.updateOne({ guildID: interaction.guild.id, movieID: docs[0].movieID }, { viewed: true, viewedDate: new Date() }).then(async () => {
									docs[0].viewed = true;
									docs[0].viewedDate = new Date();

									return await interaction.editReply({ embeds: [movieEmbed] });
								}).catch(async () => {
									return await interaction.editReply("Could not set movie to viewed.");
								});
							} else {
								return await interaction.editReply({ embeds: [movieEmbed] });
							}
						} else {
							return await interaction.editReply("Your movie list is empty, so a random movie cannot be found.");
						}
					}).catch(async () => {
						return await interaction.editReply("Something went wrong while trying to find a movie");
					});
			})
			.catch(async () => {
				return await interaction.editReply("Something went wrong.");
			});
	},
};
