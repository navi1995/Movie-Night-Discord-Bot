const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("autoview")
		.setDescription("Set autoview on or off after poll is complete. Without options this will show the current setting.")
		.addStringOption((option) => option.setName("switch").setDescription("Set autoview to either on, or off.").addChoices({ name: "On", value: "on" }, { name: "Off", value: "off" }))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, main, settings) {
		const option = interaction.options.getString("switch");
		const autoViewed = option === "on";

		if (!option) return interaction.editReply(`Currently setting is: ${settings.autoViewed ? "on" : "off"}`);

		return await main.setting.updateOne({ guildID: interaction.guild.id }, { autoViewed }, (err) => {
			if (!err) {
				return interaction.editReply(`Auto view has now been set to: ${autoViewed ? "on" : "off"}`);
			} else {
				return interaction.editReply("Couldn't set auto view, something went wrong");
			}
		}).clone();
	},
};
