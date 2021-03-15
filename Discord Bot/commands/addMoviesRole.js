module.exports = {
	name: "moviesrole",
	description: "Sets a role that is allowed to add movies to the servers list. Can also clear this role by using moviesrole clear",
	usage: "[roleName]",
	args: true,
	admin: true,
	async execute(message, args, main) {
		let addMoviesRole = args.join(' ');
		addMoviesRole = (addMoviesRole.match(/<@&([0-9]{17,21})>/) || [])[1] || (message.guild.roles.cache.find(r => addMoviesRole !== "clear" && r.name === addMoviesRole) || {}).id || addMoviesRole;

		if (!message.guild.roles.resolve(addMoviesRole) && addMoviesRole !== "clear") {
			return message.channel.send("Please provide a valid role you'd like to set in the format moviesrole [roleName], or to clear settings use moviesrole clear");
		} else {
			addMoviesRole = addMoviesRole === "clear" ? null : addMoviesRole;

			//Update the settings with the role user provided, or clear it and set to NULL.
			return main.setting.updateOne({ guildID: message.guild.id }, { addMoviesRole }, err => {
				if (!err) {
					return message.channel.send(addMoviesRole ? `Users with administrator or the role <@&${addMoviesRole}> will now be able to add movies.` : "Setting for role allowed to add movies has been cleared. Anyone will be able to add movies now.");
				} else {
					return message.channel.send("Couldn't set role for adding permissions, something went wrong");
				}
			});

		}
	}
};