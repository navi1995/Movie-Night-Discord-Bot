const { SlashCommandBuilder } = require("discord.js");
const removeList = require("./subcommands/removeList");
const removeMovie = require("./subcommands/removeMovie");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Everything related to removing movies from server.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("movie")
				.setDescription("Search a movie to remove from the server.")
				.addStringOption((option) => option.setName("search").setDescription("Movie to search for, Able to use IMDB link.").setRequired(true))
		)
		.addSubcommand((subcommand) => subcommand.setName("viewed-list").setDescription("Removes ALL movies from viewed list. USE WITH CAUTION."))
		.addSubcommand((subcommand) => subcommand.setName("unviewed-list").setDescription("Removes ALL movies from unviewed list. USE WITH CAUTION.")),
	async execute(interaction, settings) {
		const subCommand = interaction.options.getSubcommand();

		if (subCommand == "viewed-list") {
			return await removeList(interaction, true);
		}

		if (subCommand == "unviewed-list") {
			return await removeList(interaction, false);
		}

		if (subCommand == "movie") {
			return await removeMovie(interaction, settings);
		}
	},
};
