module.exports = {
	name: 'search',
	description: 'Gets details for a movie without adding to servers list.',
	aliases: ['find', 'details'],
	usage: '[movie name or search]',
	args: true,
	async execute(message, args, main) {
		var search = args.join(" ");
		var newMovie = await main.searchNewMovie(search, message);
		
		if (newMovie) {
			message.channel.send(main.buildSingleMovieEmbed(newMovie, "Movie Details (Not Added)"));
		} else {
			message.channel.send("Could not find movie, sorry!");
		}
	}		
};