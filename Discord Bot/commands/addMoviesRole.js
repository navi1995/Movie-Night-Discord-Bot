const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("moviesrole")
		.setDescription("Sets a role that is allowed to add movies to the servers list. Clear this role by using 'clear'")
		.addStringOption((option) => option.setName("allowall").setDescription("Clear the set roles and allow anyone to add movies.").addChoices({ name: "Allow All to Add", value: "all" }))
		.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow only them and admins to add movies."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, main, settings) {
		const allowAll = interaction.options.getString("allowall");
		const newAddRole = interaction.options.getRole("role");
		const currentRole = settings.addMoviesRole;
		var addMoviesRole;

		if (allowAll == "all") addMoviesRole = null;
		if (newAddRole) addMoviesRole = newAddRole.id;

		if (!allowAll && !newAddRole) return await interaction.editReply(`Current role is ${currentRole == null ? "allowing everyone to add movies." : "<@&" + currentRole + ">"}`);

		//Update the settings with the role user provided, or clear it and set to NULL.
		return await main.setting
			.updateOne({ guildID: interaction.guild.id }, { addMoviesRole })
			.then(async () => {
				return await interaction.editReply(
					addMoviesRole ? `Users with administrator or the role <@&${addMoviesRole}> will now be able to add movies.` : "Setting for role allowed to add movies has been cleared. Anyone will be able to add movies now."
				);
			})
			.catch(async () => {
				return await interaction.editReply("Couldn't set role for adding permissions, something went wrong");
			});
	},
};
