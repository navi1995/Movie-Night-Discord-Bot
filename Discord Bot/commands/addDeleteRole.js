module.exports = {
	name: "deleterole",
	description: "Sets a role that is allowed to delete movies to the servers list. If you use 'deleterole all' then anyone can delete movies. Can also clear this role by using deleterole clear",
	usage: "[roleName]",
	args: true,
	admin: true,
	async execute(message, args, main) {
		let deleteMoviesRole = args.join(' ');
		deleteMoviesRole = (deleteMoviesRole.match(/<@&([0-9]{17,21})>/) || [])[1] || (message.guild.roles.cache.find(r => (deleteMoviesRole !== "clear"  && deleteMoviesRole !== "remove" && deleteMoviesRole !== "all") && r.name === deleteMoviesRole) || {}).id || deleteMoviesRole;

		if (!message.guild.roles.resolve(deleteMoviesRole) && deleteMoviesRole !== "clear" && deleteMoviesRole !== "remove" && deleteMoviesRole !== "all") {
			return message.channel.send("Please provide a valid role you'd like to set in the format moviesrole [roleName], or to clear settings use moviesrole clear");
		} else {
			deleteMoviesRole = (deleteMoviesRole === "clear" || deleteMoviesRole === "remove") ? null : deleteMoviesRole;

			//Update the settings with the role user provided, or clear it and set to NULL.
			return main.setting.updateOne({ guildID: message.guild.id }, { deleteMoviesRole }, err => {
				if (!err) {
					return message.channel.send(deleteMoviesRole ? (deleteMoviesRole == "all" ? "All users will now be able to delete movies." : `Users with administrator or the role <@&${deleteMoviesRole}> will now be able to add movies.`) : "Setting for role allowed to add movies has been cleared. Anyone will be able to add movies now.");
				} else {
					return message.channel.send("Couldn't set role for adding permissions, something went wrong");
				}
			});

		}
	}
};