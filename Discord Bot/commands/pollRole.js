const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pollrole")
		.setDescription("Sets or clears a role that is allowed to run polls. View current setting when run without options.")
		.addStringOption((option) =>
			option.setName("clear").setDescription("Clear the set roles and only allow admin to run polls, or allow anyone to run polls.").addChoices({ name: "Clear", value: "clear" }, { name: "Allow All to run poll", value: "all" })
		)
		.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow them and admins to delete movies."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, main, settings) {
		const clear = interaction.options.getString("clear");
		const role = interaction.options.getRole("role");
		const currentRole = settings.pollRole;
		let pollRole;

		if (clear == "clear") pollRole = null;
		if (clear == "all") pollRole = "all";
		if (role) pollRole = role.id;

		if (!clear && !role) return await interaction.editReply(`Current role is ${currentRole == null ? "admins only" : currentRole == "all" ? "allow everyone." : "<@&" + currentRole + ">"}`);

		//Update the settings with the role user provided, or clear it and set to NULL.
		return main.setting
			.updateOne({ guildID: interaction.guild.id }, { pollRole }).then(async () => {
				return await interaction.editReply(
					pollRole && pollRole != "all"
						? `Users with administrator or the role <@&${pollRole}> will now be able to run polls.`
						: pollRole == "all"
						? "Anyone will now be able to run polls"
						: "Setting for role allowed to run polls has been cleared. Only admins may run polls now."
				);
			}).catch(async () => {
				return await interaction.editReply("Couldn't set role for adding permissions, something went wrong");
			});
	},
};
