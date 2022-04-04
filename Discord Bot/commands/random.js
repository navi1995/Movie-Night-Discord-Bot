module.exports = {
	name: "random",
	description: "Returns a random movie from the servers list of films to watch.",
	aliases: ["getrandom", "getone", "randommovie", "roulette"],
	admin: true,
	async execute(message, args, main, settings) {
		// TODO: Fix callback hell

		//First we get total number of movies the guild has that are unviewed.
		return main.movieModel.countDocuments({ guildID: message.guild.id, viewed: false }, (err, count) => {
			if (!err) {
				const random = Math.floor(Math.random() * count);
				const searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);

				//Then using a generated random number limited to the count, we find a random movie from the guilds list. If auto view is on, it will be set to viewed.
				return main.movieModel.find(searchOptions).skip(random).limit(1).lean().exec(async (error, docs) => {
					if (error) return message.channel.send("Something went wrong while trying to find a movie");
					if (docs && docs.length) {
						const movieEmbed = main.buildSingleMovieEmbed(docs[0]);

						if (settings.autoViewed) {
							return main.movieModel.updateOne({ guildID: message.guild.id, movieID: docs[0].movieID }, { viewed: true, viewedDate: new Date() }, async err => {
								docs[0].viewed = true;
								docs[0].viewedDate = new Date();

								if (err) {
									return message.channel.send("Could not set movie to viewed.");
								} else {
									return message.channel.send({ embeds: [movieEmbed] });
								}
							});
						} else {
							return message.channel.send({ embeds: [movieEmbed] });	
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