const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("deleterole")
		.setDescription("Sets a role that is allowed to delete movies. 'all' allows anyone to delete movies.")
		.addStringOption((option) =>
			option.setName("clear").setDescription("Clear the set roles and only allow admin to delete movies, or allow anyone to delete movies.").addChoices({ name: "Clear", value: "clear" }, { name: "Allow All to Delete", value: "all" })
		)
		.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow them and admins to delete movies."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, main, settings) {
		const clear = interaction.options.getString("clear");
		const role = interaction.options.getRole("role");
		const currentRole = settings.deleteMoviesRole;
		let deleteMoviesRole;

		if (clear == "clear") deleteMoviesRole = null;
		if (clear == "all") deleteMoviesRole = "all";
		if (role) deleteMoviesRole = role.id;

		if (!clear && !role) return await interaction.editReply(`Current role is ${currentRole == null ? "admins only" : currentRole == "all" ? "allow everyone." : "<@&" + currentRole + ">"}`);

		return await main.setting
			.updateOne({ guildID: interaction.guild.id }, { deleteMoviesRole })
			.then(async () => {
				return await interaction.editReply(
					deleteMoviesRole
						? deleteMoviesRole == "all"
							? "All users will now be able to delete movies."
							: `Users with administrator or the role <@&${deleteMoviesRole}> will now be able to delete movies.`
						: "Setting for role allowed to delete movies has been cleared. Only Admins will be able to delete now."
				);
			})
			.catch(async () => {
				return await interaction.editReply("Couldn't set role for delete permissions, something went wrong");
			});
	},
};
