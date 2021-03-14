module.exports = {
	name: "removeviewed",
	description: "Removes all VIEWED movies from servers list if no movie specified, if movie specified then will delete that specific VIEWED movie.",
	aliases: ["deleteviewed", "clearviewed"],
	usage: "[movie name for specific delete, else just the command to remove all viewed movies]",
	admin: true,
	execute(message, args, main) {
		if (!args.length) {
			return main.movieModel.deleteMany({ guildID: message.guild.id, viewed: true }, err => {
				if (!err) {
					return message.channel.send("All movies have been deleted.");
				} else {
					return message.channel.send("An error occured while trying to delete all movies");
				}
			});
		}

		const searchOptions = main.searchMovieDatabaseObject(message.guild.id, args.join(" "));
		searchOptions.viewed = true;

		//If submitted film is by member trying to delete, allow it.
		if (args.join("")) {
			return main.movieModel.findOne(searchOptions, (err, movie) => {
				if (err || !movie) {
					return message.channel.send("Movie could not be found!");
				} else {
					return movie.remove(err => {
						if (!err) {
							return message.channel.send(`Movie deleted: ${movie.name}`);
						} else {
							return message.channel.send("Could not remove movie, something went wrong.");
						}
					});
				}
			});
		} else {
			return message.channel.send("Specify a movie or remove space.");
		}
	},
};