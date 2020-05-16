module.exports = {
	name: 'add',
	description: 'Adds movie to the servers list for movies to vote on and view.',
	aliases: ['addmovie', 'insert'],
	usage: '[movie name or search]',
	args: true,
	async execute(message, args, main) {
		var search = args.join(" ");
		var newMovie = await main.searchNewMovie(search, message);
		
		if (newMovie) {
			newMovie.save(function(err) {
				if (err && err.name == "MongoError") {
					message.channel.send("Movie already exists in the list.");
				}

				if (!err) {
					const movieEmbed = main.buildSingleMovieEmbed(newMovie, "Movie Added!");

					message.channel.send(movieEmbed);
				}
			});
		}
	}		
};