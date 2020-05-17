module.exports = {
	name: 'setviewed',
	description: 'Toggles specified movie as viewed.',
	usage: '[Movie name to set as viewed]',
	args: true,
	async execute(message, args, main) {
		var movie = args.join(" ");
		var searchOptions = main.searchMovieDatabaseObject(message.guild.id, movie);

		return main.movieModel.findOne(searchOptions, function(err, movie) {
			if (!message.member.hasPermission("ADMINISTRATOR")) {
				return message.channel.send("Non-administrators can not set movies as viewed.");
			} else if (err || !movie) {
				message.channel.send("Movie could not be found!");
			} else if (message.member.hasPermission("ADMINISTRATOR")) {
				movie.updateOne({ viewed: !movie.viewed, viewedDate: movie.viewed ? null : new Date() }, function(err) {
					if (!err) {
						message.channel.send(`${movie.name} has been set to ${!movie.viewed ? "viewed" : "unviewed"}!`);
					}
				});
			} 
		});
	},
};