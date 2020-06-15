module.exports = {
	name: "setviewed",
	description: "Toggles specified movie as viewed.",
	usage: "[Movie name to set as viewed]",
	args: true,
	admin: true,
	async execute(message, args, main, callback) {
		var movie = args.join(" ");
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

		return main.movieModel.findOne(searchOptions, function(err, movie) {
			if (err || !movie) {
				message.channel.send("Movie could not be found!");
				
				return callback();
			} else {
				movie.updateOne({ viewed: !movie.viewed, viewedDate: movie.viewed ? null : new Date() }, function(err) {
					if (!err) {
						message.channel.send(`${movie.name} has been set to ${!movie.viewed ? "viewed" : "unviewed"}!`);
					} else {
						message.channel.send("Could not set movie to viewed, something went wrong.");
					}

					return callback();
				});
			} 
		});
	},
};