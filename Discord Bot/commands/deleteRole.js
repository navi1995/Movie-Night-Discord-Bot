const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Setting } = require("../../Models/schema");
const SHOW_SETTING = "show-setting";
const ADD = "set-role";
const ADMIN_ONLY = "admin-only";
const ALLOW_ALL = "allow-all";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete-role")
		.setDescription("Sets or shows role that's allowed to delete movies.")
		.addSubcommand((subcommand) => subcommand.setName(SHOW_SETTING).setDescription("Shows current delete role setting."))
		.addSubcommand((subcommand) =>
			subcommand
				.setName(ADD)
				.setDescription("Sets a role that can delete movies.")
				.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow them and admins to delete movies."))
		)
		.addSubcommand((subcommand) => subcommand.setName(ADMIN_ONLY).setDescription("Only allow admins to delete movies."))
		.addSubcommand((subcommand) => subcommand.setName(ALLOW_ALL).setDescription("Allow everyone the ability to delete movies."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, settings) {
		const role = interaction.options.getSubcommand() == ADD && interaction.options.getRole("role");
		const currentRole = settings.deleteMoviesRole;
		let deleteMoviesRole;

		if (interaction.options.getSubcommand() == ADMIN_ONLY) deleteMoviesRole = null;
		if (interaction.options.getSubcommand() == ALLOW_ALL) deleteMoviesRole = "all";
		if (role) deleteMoviesRole = role.id;

		if (interaction.options.getSubcommand() == SHOW_SETTING) return await interaction.editReply(`Current role is ${currentRole == null ? "admins only" : currentRole == "all" ? "allow everyone." : "<@&" + currentRole + ">"}`);

		await Setting.updateOne({ guildID: interaction.guild.id }, { deleteMoviesRole });

		return await interaction.editReply(
			deleteMoviesRole
				? deleteMoviesRole == "all"
					? "All users will now be able to delete movies."
					: `Users with administrator or the role <@&${deleteMoviesRole}> will now be able to delete movies.`
				: "Only Admins will be able to delete movies."
		);
	},
};
