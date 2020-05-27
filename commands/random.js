module.exports = {
	name: "random",
	description: "Returns a random movie from the servers list of films to watch.",
	aliases: ["getrandom", "getone", "randommovie", "roulette"],
	admin: true,
	async execute(message, args, main) {
		//First we get total number of movies the guild has that are unviewed.
		return main.movieModel.count({guildID: message.guild.id, viewed: false }, function(err, count) {
			if (!err) {
				var random = Math.floor(Math.random() * count);
				var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
				var settings = main.guildSettings.get(message.guild.id);

				//Then using a generated random number limited to the count, we find a random movie from the guilds list. If auto view is on, it will be set to viewed.
				main.movieModel.find(searchOptions).skip(random).limit(1).exec(async function (error, docs) {
					if (docs && docs.length > 0) {
						if (settings.autoViewed) {
							await main.movieModel.updateOne({guildID: message.guild.id, movieID: docs[0].movieID}, { viewed: true, viewedDate: new Date() }, function(err) {
								docs[0].viewed = true;
								docs[0].viewedDate = new Date();

								if (!err) {
									return message.channel.send(main.buildSingleMovieEmbed(docs[0]));
								} else {
									message.channel.send(main.buildSingleMovieEmbed(docs[0]));
									
									return message.channel.send("Could not set movie to viewed.");
								}
							});
						} else {
							return message.channel.send(main.buildSingleMovieEmbed(docs[0]));
						}
					} else {
						return message.channel.send("Your movie list is empty, so a random movie cannot be found.");
					}
				});
			} else {
				return message.channel.send("Something went wrong.");
			}
		});
	},
};