module.exports = {
	name: "removeviewed",
	description: "Removes all VIEWED movies from servers list if no movie specified, if movie specified then will delete that specific VIEWED movie.",
	aliases: ["deleteviewed", "clearviewed"],
	usage: "[movie name for specific delete, else just the command to remove all viewed movies]",
	admin: true,
	execute(message, args, main) {
		if (!args.length) {
			return main.movieModel.deleteMany({guildID: message.guild.id, viewed: true }, function(err) {
				if (!err) {
					message.channel.send("All movies have been deleted.");
				} else {
					message.channel.send("An error occured while trying to delete all movies");
				}

				return;
			});
		}

		var movie = args.join(" ");
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

		searchOptions.viewed = true;

		//If submitted film is by member trying to delete, allow it.
		if (movie != "") {
			return main.movieModel.findOne(searchOptions, function(err, movie) {
				if (err || !movie) {
					message.channel.send("Movie could not be found!");
					
					return;
				} else {
					return movie.remove(function(err) {
						if (!err) {
							message.channel.send(`Movie deleted: ${movie.name}`);
						} else {
							message.channel.send("Could not remove movie, something went wrong.");
						}

						return;
					});
				}
			});
		} else {
			message.channel.send("Specify a movie or remove space.");

			return;
		}
	},
};