const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");
const { Movie } = require("../../Models/schema");
const { movieSearchOptionsForDb, buildSingleMovieEmbed } = require("../helpers/helperFunctions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("set")
		.setDescription("Allows setting movie to watched or unwatched")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("viewed")
				.setDescription("Set movie to Viewed")
				.addStringOption((option) => option.setName("movie").setDescription("Movie name or IMDB link of movie to search for and toggle.").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("unviewed")
				.setDescription("Set movie to Unviewed")
				.addStringOption((option) => option.setName("movie").setDescription("Movie name or IMDB link of movie to search for and toggle.").setRequired(true))
		),
	async execute(interaction, settings) {
		const movieSearch = interaction.options.getString("movie");
		const searchOptions = movieSearchOptionsForDb(interaction.guild.id, movieSearch);
		const movie = await Movie.findOne(searchOptions);
		const viewedCommand = interaction.options.getSubcommand() == "viewed";
		const option = viewedCommand ? "Viewed" : "Unviewed";

		if (!movie) {
			return await interaction.editReply("Movie could not be found!");
		} else if ((settings.viewedMoviesRole && (interaction.member.roles.cache.has(settings.viewedMoviesRole) || settings.viewedMoviesRole == "all")) || interaction.member.permissions.has("Administrator")) {
			if ((movie.viewed && viewedCommand) || (!movie.viewed && !viewedCommand)) {
				return await interaction.editReply(`${movie.name} is already set to ${option}`);
			}

			const collectorFilter = (i) => i.user.id === interaction.user.id;
			const confirm = new ButtonBuilder().setCustomId("confirm").setLabel(`Set to ${option}?`).setStyle(ButtonStyle.Primary);
			const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);
			const row = new ActionRowBuilder().addComponents(confirm, cancel);
			const movieEmbed = buildSingleMovieEmbed(movie, `Are you sure you want to set ${movie.name} to ${option}?`);
			const reply = await interaction.editReply({
				embeds: [movieEmbed],
				components: [row],
			});

			try {
				const confirmation = await reply.awaitMessageComponent({ collectorFilter, time: 15000 });

				if (confirmation.customId === "confirm") {
					await movie.updateOne({ viewed: !movie.viewed, viewedDate: movie.viewed ? null : new Date() });

					return await confirmation.update({ content: `${movie.name} has been set to ${option}!`, components: [] });
				} else if (confirmation.customId === "cancel") {
					await confirmation.update({ content: `${movie.name} has NOT been set to ${option}.`, components: [] });
				}
			} catch (e) {
				await interaction.editReply({ content: "Confirmation not received within 1 minute, cancelling command.", components: [], embeds: [] });
			}
		} else {
			return await interaction.editReply("Non-administrators can only set viewed if viewedrole has been set to all or a specific role.");
		}
	},
};
