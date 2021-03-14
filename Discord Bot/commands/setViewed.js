module.exports = {
	name: "setviewed",
	description: "Toggles specified movie as viewed.",
	usage: "[Movie name to set as viewed]",
	args: true,
	admin: true,
	async execute(message, args, main) {
		const searchOptions = main.searchMovieDatabaseObject(message.guild.id, args.join(" "));

		return main.movieModel.findOne(searchOptions, (err, movie) => {
			if (err || !movie) {
				return message.channel.send("Movie could not be found!");
			} else {
				return movie.updateOne({ viewed: !movie.viewed, viewedDate: movie.viewed ? null : new Date() }, err => {
					if (!err) {
						return message.channel.send(`${movie.name} has been set to ${!movie.viewed ? "" : "un"}viewed!`);
					} else {
						return message.channel.send("Could not set movie to viewed, something went wrong.");
					}
				});
			} 
		});
	},
};