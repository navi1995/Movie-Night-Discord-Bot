module.exports = {
	name: "search",
	description: "Gets details for a movie without adding to servers list.",
	aliases: ["find", "details"],
	usage: "[movie name or search]",
	args: true,
	async execute(message, args, main) {
		return main.searchNewMovie(args.join(" "), message).then(([newMovie]) => {
			//No need for else, searchNewMovie alerts user if no movie found.
			return newMovie && message.channel.send(main.buildSingleMovieEmbed(newMovie, "Movie Details (Not Added)", true));
		}).catch(err => {
			console.error("Search.js", err);
			return message.channel.send("Something went wrong.");
		});
	}	
};