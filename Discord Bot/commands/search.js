module.exports = {
	name: "search",
	description: "Gets details for a movie without adding to servers list.",
	aliases: ["find", "details"],
	usage: "[movie name or search]",
	args: true,
	async execute(message, args, main) {
		var search = args.join(" ");

		try {
			return main.searchNewMovie(search, message).then(([newMovie]) => {
				//No need for else, searchNewMovie alerts user if no movie found.
				if (newMovie) {
					message.channel.send(main.buildSingleMovieEmbed(newMovie, "Movie Details (Not Added)", true));
				}

				return;
			});
		} catch (e) {
			console.error("Search.js", e);
			message.channel.send("Something went wrong.");
			
			return;
		}		
	}		
};