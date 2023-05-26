const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Setting } = require("../../Models/schema");
const SHOW_SETTING = "show-setting";
const ADD = "set-role";
const ADMIN_ONLY = "admin-only";
const ALLOW_ALL = "allow-all";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("start-poll-role")
		.setDescription("Sets or shows role that is allowed to start poles.")
		.addSubcommand((subcommand) => subcommand.setName(SHOW_SETTING).setDescription("Shows current poll starting role."))
		.addSubcommand((subcommand) =>
			subcommand
				.setName(ADD)
				.setDescription("Sets a role that can start polls.")
				.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow them and admins to start polls."))
		)
		.addSubcommand((subcommand) => subcommand.setName(ADMIN_ONLY).setDescription("Only allow admins to start polls."))
		.addSubcommand((subcommand) => subcommand.setName(ALLOW_ALL).setDescription("Allow everyone the ability to start polls."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, settings) {
		const role = interaction.options.getSubcommand() == ADD && interaction.options.getRole("role");
		const currentRole = settings.pollRole;
		let pollRole;

		if (interaction.options.getSubcommand() == ADMIN_ONLY) pollRole = null;
		if (interaction.options.getSubcommand() == ALLOW_ALL) pollRole = "all";
		if (role) pollRole = role.id;

		if (interaction.options.getSubcommand() == SHOW_SETTING) return await interaction.editReply(`Current role is ${currentRole == null ? "admins only" : currentRole == "all" ? "allow everyone." : "<@&" + currentRole + ">"}`);

		//Update the settings with the role user provided, or clear it and set to NULL.
		await Setting.updateOne({ guildID: interaction.guild.id }, { pollRole });

		return await interaction.editReply(
			pollRole && pollRole != "all"
				? `Users with administrator or the role <@&${pollRole}> will now be able to run polls.`
				: pollRole == "all"
				? "Anyone will now be able to run polls"
				: "Only admins may run polls now."
		);
	},
};
