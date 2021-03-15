const emojis = require("../emojis.json");

module.exports = {
	name: "add",
	description: "Adds movie to the servers list for movies to vote on and view.",
	aliases: ["addmovie", "insert"],
	usage: "[movie name or search]",
	args: true,
	async execute(message, args, main, settings) {
		// TODO: fix callback hell
		const search = args.join(" ");

		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set. 
		//If setting has been cleared, allow anyone to add movies.
		if (settings.addMoviesRole && !message.member.roles.cache.has(settings.addMoviesRole) && !message.member.hasPermission("ADMINISTRATOR")) {
			return message.channel.send(`Movies can only be added by administrators or users with the role ${settings.addMoviesRole ? '<@&' + settings.addMoviesRole + '>' : 'set with the `addMoviesRole` command by an administrator'}`);
		}

		//Continue with normal search if the above doesnt return.
		try {
			return main.searchNewMovie(search, message).then(([newMovie, data]) => {
				//No need for else, searchNewMovie alerts user if no movie found.
				if (newMovie) {
					return newMovie.save(err => {
						if (err && err.name == "MongoError") {
							return message.channel.send("Movie already exists in the list. It may be marked as 'Viewed'");
						}

						if(err) {
							console.log(err);
							return message.channel.send("Something went wrong, couldn't run command");
						}

						//If the search results from the API returned more than one result, we ask the user to confirm using REACTIONS on the message. 
						if (data && (data.total_results > 1 || (data.movie_results && data.movie_results.length > 1))) {
							const movieEmbed = main.buildSingleMovieEmbed(newMovie, "Is this the movie you want to add?");
		
							return message.channel.send(movieEmbed).then(async embedMessage => {
								const filter = (reaction, user) => [emojis.yes, emojis.no].includes(reaction.emoji.name) && user.id == message.author.id;

								try {
									await embedMessage.react(emojis.yes);
									await embedMessage.react(emojis.no);
								} catch (e) {
									console.log("Message deleted");

									return newMovie.remove();
								}
								
								//Wait for user to confirm if movie presented to them is what they wish to be added to the list or not.								
								return embedMessage.awaitReactions(filter, { max: 1, time: 15000, errors: ["time"] }).then(async collected => {
									const reaction = collected.first();

									if (reaction.emoji.name == emojis.yes) {
										return message.channel.send("Movie will be added to the list!");
									} else {
										await message.channel.send("Movie will not be added to the list. Try using an IMDB link instead?");
										
										return newMovie.remove();
									}
								}).catch(async () => {
									await message.channel.send("Movie will not be added, you didn't respond in time. Try using an IMDB link instead?");

									return newMovie.remove();
								});
							});
						} else {
							return message.channel.send(main.buildSingleMovieEmbed(newMovie, "Movie Added!"));
						}
					});
				}
			});
		} catch (e) {
			console.error("Add.js", e);
			
			return message.channel.send("Something went wrong.");
		}
	}	
}