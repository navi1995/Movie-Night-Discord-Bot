const emojis = require("../emojis.json");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("toggleviewed")
		.setDescription("Toggles specified movie as viewed or unviewed.")
		.addStringOption((option) => option.setName("movie").setDescription("Movie name or IMDB link of movie to search for and toggle.").setRequired(true)),
	async execute(interaction, main, settings) {
		const movieSearch = interaction.options.getString("movie");
		const searchOptions = main.searchMovieDatabaseObject(interaction.guild.id, movieSearch);

		return main.movieModel
			.findOne(searchOptions, (err, movie) => {
				if (err || !movie) {
					return interaction.editReply("Movie could not be found!");
				} else if ((settings.viewedMoviesRole && (interaction.member.roles.cache.has(settings.viewedMoviesRole) || settings.viewedMoviesRole == "all")) || interaction.member.permissions.has("Administrator")) {
					return interaction.editReply(`Are you sure you want to set ${movie.name} to ${!movie.viewed ? "" : "un"}viewed?`).then(async () => {
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
									return movie.updateOne({ viewed: !movie.viewed, viewedDate: movie.viewed ? null : new Date() }, (err) => {
										if (!err) {
											return interaction.followUp(`${movie.name} has been set to ${!movie.viewed ? "" : "un"}viewed!`);
										} else {
											return interaction.followUp("Could not set movie to viewed, something went wrong.");
										}
									}).clone();
								} else {
									return interaction.followUp(`${movie.name} has NOT been set to ${!movie.viewed ? "" : "un"}viewed.`);
								}
							})
							.catch(async () => {
								return interaction.followUp("Couldn't get your response.");
							});
					});
				} else {
					return interaction.editReply("Non-administrators can only set viewed if viewedrole has been set to all or a specific role.");
				}
			})
			.clone();
	},
};
