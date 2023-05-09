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

		if (!option) return await interaction.editReply(`Currently setting is: ${settings.autoViewed ? "on" : "off"}`);

		return await main.setting
			.updateOne({ guildID: interaction.guild.id }, { autoViewed })
			.then(async () => {
				return await interaction.editReply(`Auto view has now been set to: ${autoViewed ? "on" : "off"}`);
			})
			.catch(async () => {
				return await interaction.editReply("Couldn't set auto view, something went wrong");
			});
	},
};
