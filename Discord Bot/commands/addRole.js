const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Setting } = require("../../Models/schema");
const SHOW_SETTING = "show-setting";
const ADD = "set-role";
const ALLOW_ALL = "allow-all";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-movies-role")
		.setDescription("Sets or shows role that's allowed to add movies.")
		.addSubcommand((subcommand) => subcommand.setName(SHOW_SETTING).setDescription("Shows current add role setting."))
		.addSubcommand((subcommand) =>
			subcommand
				.setName(ADD)
				.setDescription("Sets a role that can add movies.")
				.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow them and admins to add movies."))
		)
		.addSubcommand((subcommand) => subcommand.setName(ALLOW_ALL).setDescription("Allow everyone the ability to add movies."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, settings) {
		const role = interaction.options.getSubcommand() == ADD && interaction.options.getRole("role");
		const currentRole = settings.addMoviesRole;
		var addMoviesRole;

		if (interaction.options.getSubcommand() == ALLOW_ALL) addMoviesRole = null;
		if (role) addMoviesRole = role.id;

		if (interaction.options.getSubcommand() == SHOW_SETTING) return await interaction.editReply(`Current role is ${currentRole == null ? "allowing everyone to add movies." : "<@&" + currentRole + ">"}`);

		//Update the settings with the role user provided, or clear it and set to NULL.
		await Setting.updateOne({ guildID: interaction.guild.id }, { addMoviesRole });

		return await interaction.editReply(
			addMoviesRole ? `Users with administrator or the role <@&${addMoviesRole}> will now be able to add movies.` : "Setting for role allowed to add movies has been cleared. Anyone will be able to add movies now."
		);
	},
};
