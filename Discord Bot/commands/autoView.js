const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Setting } = require("../../Models/schema");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("autoview")
		.setDescription("Set autoview on or off after poll is complete. Without options this will show the current setting.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("on")
				.setDescription("Sets autoview to on")		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("off")
				.setDescription("Sets autoview to off")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("show-setting")
				.setDescription("Shows current autoview setting")
		),
	async execute(interaction, settings) {
		const option = interaction.options.getSubcommand();
		const autoViewed = option === "on";

		if (option == "showsetting") return await interaction.editReply(`Currently setting is: ${settings.autoViewed ? "on" : "off"}`);

		await Setting.updateOne({ guildID: interaction.guild.id }, { autoViewed });

		return await interaction.editReply(`Auto view has now been set to: ${autoViewed ? "on" : "off"}`);
	},
};
