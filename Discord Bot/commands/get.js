const { SlashCommandBuilder } = require("discord.js");
const postViewedList = require("./subcommands/viewed");
const postUnviewedList = require("./subcommands/unviewed");
const postRandomMovie = require("./subcommands/random");
const postFoundMovie = require("./subcommands/fetch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("get")
		.setDescription("Everything related to fetching movies.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("movie")
				.setDescription("Lookup movie details from unviewed and movies or from online without adding.")
				.addStringOption((option) => option.setName("search").setDescription("Movie to search for, Able to use IMDB link.").setRequired(true))
		)
		.addSubcommand((subcommand) => subcommand.setName("random").setDescription("Get a random movie from your unviewed list.")) // Get one from unviewed
		.addSubcommand((subcommand) => subcommand.setName("viewed-list").setDescription("Gets list of all servers viewed movies.")) // Search options viewed only
		.addSubcommand((subcommand) => subcommand.setName("unviewed-list").setDescription("Gets list of all servers unviewed movies.")), // Search options unviewed only
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();

		if (subCommand == "random") {
			return await postRandomMovie(interaction);
		}

		if (subCommand == "viewed-list") {
			return await postViewedList(interaction);
		}

		if (subCommand == "unviewed-list") {
			return await postUnviewedList(interaction);
		}

		if (subCommand == "movie") {
			return await postFoundMovie(interaction);
		}
	},
};
