module.exports = {
	name: 'remove',
	description: 'Removes all movies from servers list if no movie specified, if movie specified then will delete that specific one.',
	aliases: ['delete', 'clear'],
	usage: '[movie name for specific delete, else just the command]',
	execute(message, args, main) {
		if (!args.length && !message.member.hasPermission("ADMINISTRATOR")) {
			return message.channel.send("Sorry, only Administrators can delete all movies.");
		}

		if (!args.length) {
			return main.movieModel.deleteMany({guildID: message.guild.id}, function(err) {
				if (!err) {
					return message.channel.send("All movies have been deleted.");
				}
			});
		}

		var movie = args.join(" ");
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

		//If submitted film is by member trying to delete, allow it.
		if (movie != "") {
			return main.movieModel.findOne(searchOptions, function(err, movie) {
				if (err || !movie) {
					message.channel.send("Movie could not be found!");
				} else {
					console.log(movie.submittedBy);
					console.log(message.member.user);
					if ("<@" + message.member.user.id + ">" == movie.submittedBy || message.member.hasPermission("ADMINISTRATOR")) {
						movie.remove(function(err) {
							if (!err) {
								message.channel.send(`Movie deleted: ${movie.name}`);
							}
						});
					} else {
						message.channel.send("Non-administrators can only delete movies they have submitted");
					}
				}
			});
		} else {
			return message.channel.send("Specify a movie or remove space.");
		}
	},
};