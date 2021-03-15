module.exports = {
	name: "remove",
	description: "Removes all unviewed movies from servers list if no movie specified, if movie specified then will delete that specific unviewed movie.",
	aliases: ["delete", "clear"],
	usage: "[movie name for specific delete, else just the command]",
	//admin: true, --WE don't use admin tag here as user should be able to remove their own movies before viewing.
	execute(message, args, main) {
		if (!args.length) {
			if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Sorry, only Administrators can delete all movies.");
			
			//If no arguments specified, we delete all movies in the list. In future add reaction check.
			return main.movieModel.deleteMany({ guildID: message.guild.id, viewed: false }, err => {
				if (!err) {
					return message.channel.send("All movies have been deleted.");
				} else {
					return message.channel.send("An error occured while trying to delete all movies");
				}
			});
		}

		const searchOptions = main.searchMovieDatabaseObject(message.guild.id, args.join(" "), true);

		//If submitted film is by member trying to delete, allow it.
		if (args.join(" ")) {
			return main.movieModel.findOne(searchOptions, (err, movie) => {
				if (err || !movie) {
					return message.channel.send("Movie could not be found! It may be in the viewed list. Use removeviewed instead.");
				} else if ("<@" + message.member.user.id + ">" === movie.submittedBy || message.member.hasPermission("ADMINISTRATOR")) {
					return movie.remove(err => {
						if (!err) {
							return message.channel.send(`Movie deleted: ${movie.name}`);
						} else {
							return message.channel.send("Could not remove movie, something went wrong.");
						}
					});
				} else {
					return message.channel.send("Non-administrators can only delete movies they have submitted");
				}
			});
		} else {
			return message.channel.send("Specify a movie or remove space.");
		}
	},
};