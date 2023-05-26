const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Setting } = require("../../Models/schema");
const SHOW_SETTING = "show-setting";
const ADD = "set-role";
const ADMIN_ONLY = "admin-only";
const ALLOW_ALL = "allow-all";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("view-role")
		.setDescription("Sets or shows role that is allowed to change viewed status of movies.")
		.addSubcommand((subcommand) => subcommand.setName(SHOW_SETTING).setDescription("Shows current view role setting."))
		.addSubcommand((subcommand) =>
			subcommand
				.setName(ADD)
				.setDescription("Sets a role that can change viewed status of movies.")
				.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow them and admins to change viewed status of movies."))
		)
		.addSubcommand((subcommand) => subcommand.setName(ADMIN_ONLY).setDescription("Only allow admins to change viewed status of movies."))
		.addSubcommand((subcommand) => subcommand.setName(ALLOW_ALL).setDescription("Allow everyone the ability to change viewed status of movies."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, settings) {
		const role = interaction.options.getSubcommand() == ADD && interaction.options.getRole("role");
		const currentRole = settings.viewedMoviesRole;
		var viewedMoviesRole;

		if (interaction.options.getSubcommand() == ADMIN_ONLY) viewedMoviesRole = null;
		if (interaction.options.getSubcommand() == ALLOW_ALL) viewedMoviesRole = "all";
		if (role) viewedMoviesRole = role.id;

		if (interaction.options.getSubcommand() == SHOW_SETTING) return await interaction.editReply(`Current role is ${currentRole == null ? "admins only" : currentRole == "all" ? "allow everyone." : "<@&" + currentRole + ">"}`);

		//Update the settings with the role user provided, or clear it and set to NULL.
		await Setting.updateOne({ guildID: interaction.guild.id }, { viewedMoviesRole });

		return await interaction.editReply(
			viewedMoviesRole
				? viewedMoviesRole == "all"
					? "All users will now be able to toggle viewed status for movies."
					: `Users with administrator or the role <@&${viewedMoviesRole}> will now be able to toggle viewed status for movies.`
				: "Only admins will be able to toggle movie viewed status now."
		);
	},
};
