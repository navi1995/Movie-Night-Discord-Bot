module.exports = {
	name: "random",
	description: "Returns a random movie from the servers list of films to watch.",
	aliases: ["getrandom", "getone", "randommovie", "roulette"],
	admin: true,
	async execute(message, args, main, callback, settings) {
		//First we get total number of movies the guild has that are unviewed.
		return main.movieModel.countDocuments({guildID: message.guild.id, viewed: false }, function(err, count) {
			if (!err) {
				var random = Math.floor(Math.random() * count);
				var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);

				//Then using a generated random number limited to the count, we find a random movie from the guilds list. If auto view is on, it will be set to viewed.
				return main.movieModel.find(searchOptions).skip(random).limit(1).lean().exec(async function (error, docs) {
					if (docs && docs.length > 0) {
						if (settings.autoViewed) {
							//await 
							return main.movieModel.updateOne({guildID: message.guild.id, movieID: docs[0].movieID}, { viewed: true, viewedDate: new Date() }, function(err) {
								docs[0].viewed = true;
								docs[0].viewedDate = new Date();

								if (!err) {
									message.channel.send(main.buildSingleMovieEmbed(docs[0]));
								} else {
									message.channel.send(main.buildSingleMovieEmbed(docs[0]));									
									message.channel.send("Could not set movie to viewed.");
								}

								return callback();
							});
						} else {
							message.channel.send(main.buildSingleMovieEmbed(docs[0]));

							return callback();
						}
					} else {
						message.channel.send("Your movie list is empty, so a random movie cannot be found.");

						return callback();
					}
				});
			} else {
				message.channel.send("Something went wrong.");
				
				return callback();
			}
		});
	},
};