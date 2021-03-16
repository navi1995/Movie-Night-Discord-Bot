module.exports = {
	name: "viewedrole",
	description: `Sets a role that is allowed to set movies to be unviewed/viewed. If you use 'viewedrole all' then anyone can update. Can also clear this role by using viewedrole clear`,
	usage: "[roleName]",
	args: true,
	admin: true,
	async execute(message, args, main) {
		let viewedMoviesRole = args.join(' ');
		viewedMoviesRole = (viewedMoviesRole.match(/<@&([0-9]{17,21})>/) || [])[1] || (message.guild.roles.cache.find(r => (viewedMoviesRole !== "clear"  && viewedMoviesRole !== "remove" && viewedMoviesRole !== "all") && r.name === viewedMoviesRole) || {}).id || viewedMoviesRole;

		if (!message.guild.roles.resolve(viewedMoviesRole) && viewedMoviesRole !== "clear" && viewedMoviesRole !== "remove" && viewedMoviesRole !== "all") {
			return message.channel.send(`Please provide a valid role you'd like to set in the format ${this.name} [roleName], or to clear settings use ${this.name} clear`);
		} else {
			viewedMoviesRole = (viewedMoviesRole === "clear" || viewedMoviesRole === "remove") ? null : viewedMoviesRole;

			//Update the settings with the role user provided, or clear it and set to NULL.
			return main.setting.updateOne({ guildID: message.guild.id }, { viewedMoviesRole }, err => {
				if (!err) {
					return message.channel.send(viewedMoviesRole ? (viewedMoviesRole == "all" ? "All users will now be able to toggle viewed status for movies." : `Users with administrator or the role <@&${viewedMoviesRole}> will now be able to toggle viewed status for movies.`) : "Setting for role allowed to add movies has been cleared. Anyone will be able to toggle viewed status for movies now.");
				} else {
					return message.channel.send("Couldn't set role for adding permissions, something went wrong");
				}
			});

		}
	}
};
