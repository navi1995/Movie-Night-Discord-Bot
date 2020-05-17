const emojis = require("../emojis.json");

module.exports = {
	name: 'add',
	description: 'Adds movie to the servers list for movies to vote on and view.',
	aliases: ['addmovie', 'insert'],
	usage: '[movie name or search]',
	args: true,
	async execute(message, args, main) {
		var search = args.join(" ");
		await main.searchNewMovie(search, message, function(newMovie, data) {
			console.log(data);
			if (newMovie) {
				newMovie.save(function(err) {
					if (err && err.name == "MongoError") {
						return message.channel.send("Movie already exists in the list. It may be marked as 'Viewed'");
					}
	
					if (!err) {
						if (data && (data.total_results > 1 || (data.movie_results && data.movie_results.length > 1))) {
							const movieEmbed = main.buildSingleMovieEmbed(newMovie, "Is this the movie you want to add?");
		
							message.channel.send(movieEmbed).then(async (embedMessage) => {
								const filter = (reaction, user) => { return (reaction.emoji.name == emojis.yes || reaction.emoji.name == emojis.no) && user.id == message.author.id;}

								await embedMessage.react(emojis.yes)
								await embedMessage.react(emojis.no);								
								embedMessage.awaitReactions(filter, {max: 1, time: 15000, errors: ['time'] })
									.then(function(collected) {
										const reaction = collected.first();
	
										if (reaction.emoji.name == emojis.yes) {
											return message.channel.send("Movie will be added to the list!");
										} else {
											message.channel.send("Movie will not be added to the list. Try using an IMDB link instead?");
											return removeMovie(newMovie);
										}
									}).catch(() => {
										message.channel.send("Movie will not be added, you didn't respond in time.");
										return removeMovie(newMovie)
									});
							});
						} else {
							const movieEmbed = main.buildSingleMovieEmbed(newMovie, "Movie Added!");
							return message.channel.send(movieEmbed);
						}
					}
				});
			}
		});
	}		
};

function removeMovie(newMovie) {
	newMovie.remove(function() {});
}