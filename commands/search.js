module.exports = {
	name: "search",
	description: "Gets details for a movie without adding to servers list.",
	aliases: ["find", "details"],
	usage: "[movie name or search]",
	args: true,
	async execute(message, args, main, callback) {
		var search = args.join(" ");

		try {
			//await 
			return main.searchNewMovie(search, message, function(newMovie) {
				//No need for else, searchNewMovie alerts user if no movie found.
				if (newMovie) {
					message.channel.send(main.buildSingleMovieEmbed(newMovie, "Movie Details (Not Added)", true));
				}

				return callback();
			});
		} catch (e) {
			console.error("Search.js", e);
			message.channel.send("Something went wrong.");
			
			return callback();
		}		
	}		
};