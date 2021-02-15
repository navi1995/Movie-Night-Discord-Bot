module.exports = {
	name: "remove",
	description: "Removes all unviewed movies from servers list if no movie specified, if movie specified then will delete that specific unviewed movie.",
	aliases: ["delete", "clear"],
	usage: "[movie name for specific delete, else just the command]",
	//admin: true, --WE don't use admin tag here as user should be able to remove their own movies before viewing.
	execute(message, args, main, callback) {
		if (!args.length && !message.member.hasPermission("ADMINISTRATOR")) {
			message.channel.send("Sorry, only Administrators can delete all movies.");

			return callback();
		}

		if (!args.length) {
			//If no arguments specified, we delete all movies in the list. In future add reaction check.
			return main.movieModel.deleteMany({guildID: message.guild.id, viewed: false }, function(err) {
				if (!err) {
					message.channel.send("All movies have been deleted.");
				} else {
					message.channel.send("An error occured while trying to delete all movies");
				}

				return callback();
			});
		}

		var movie = args.join(" ");
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie, true);

		//If submitted film is by member trying to delete, allow it.
		if (movie != "") {
			return main.movieModel.findOne(searchOptions, function(err, movie) {
				if (err || !movie) {
					message.channel.send("Movie could not be found! It may be in the viewed list. Use removeviewed instead.");

					return callback();
				} else if ("<@" + message.member.user.id + ">" == movie.submittedBy || message.member.hasPermission("ADMINISTRATOR")) {
					return movie.remove(function(err) {
						if (!err) {
							message.channel.send(`Movie deleted: ${movie.name}`);
						} else {
							message.channel.send("Could not remove movie, something went wrong.");
						}

						return callback();
					});
				} else {
					message.channel.send("Non-administrators can only delete movies they have submitted");

					return callback();
				}
			});
		} else {
			message.channel.send("Specify a movie or remove space.");
			
			return callback();
		}
	},
};