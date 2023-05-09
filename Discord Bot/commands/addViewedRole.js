const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("viewedrole")
		.setDescription("Set a role that is allowed to set movies to be (un)viewed. Use 'clear' to allow anyone to update.")
		.addStringOption((option) =>
			option
				.setName("clear")
				.setDescription("Clear the set roles and only allow admin to set movies to viewed, or allow anyone.")
				.addChoices({ name: "Clear and set to Admin only", value: "clear" }, { name: "Allow All to Delete", value: "all" })
		)
		.addRoleOption((option) => option.setName("role").setDescription("Select a role to allow them and admins to set movies to viewed."))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, main, settings) {
		const clear = interaction.options.getString("clear");
		const role = interaction.options.getRole("role");
		const currentRole = settings.viewedMoviesRole;
		var viewedMoviesRole;

		if (clear == "clear") viewedMoviesRole = null;
		if (clear == "all") viewedMoviesRole = "all";
		if (role) viewedMoviesRole = role.id;

		if (!clear && !role) return await interaction.editReply(`Current role is ${currentRole == null ? "admins only" : currentRole == "all" ? "allow everyone." : "<@&" + currentRole + ">"}`);

		//Update the settings with the role user provided, or clear it and set to NULL.
		return await main.setting
			.updateOne({ guildID: interaction.guild.id }, { viewedMoviesRole })
			.then(async () => {
				return await interaction.editReply(
					viewedMoviesRole
						? viewedMoviesRole == "all"
							? "All users will now be able to toggle viewed status for movies."
							: `Users with administrator or the role <@&${viewedMoviesRole}> will now be able to toggle viewed status for movies.`
						: "Setting for role allowed to add movies has been cleared. Only admins will be able to delete now."
				);
			})
			.catch(async () => {
				return await interaction.editReply("Couldn't set role for adding permissions, something went wrong");
			});
	},
};
