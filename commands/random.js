module.exports = {
	name: 'random',
	description: 'Returns a random movie from the servers list of films to watch.',
	aliases: ['getrandom', 'getone', 'randommovie', 'roulette'],
	async execute(message, args, main) {
		return main.movieModel.count({guildID: message.guild.id, viewed: false }, function(err, count) {
			if (!err) {
				var random = Math.floor(Math.random() * count);
				var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "", true);
				var settings = main.guildSettings.get(message.guild.id);

				main.movieModel.find(searchOptions).skip(random).limit(1).exec(async function (error, docs) {
					if (docs && docs.length > 0) {
						if (settings.autoViewed) {
							await main.movieModel.updateOne({guildID: message.guild.id, movieID: docs[0].movieID}, { viewed: true, viewedDate: new Date() }, function(err, doc) {
								docs[0].viewed = true;
								docs[0].viewedDate = new Date();

								if (!err) {
									return message.channel.send(main.buildSingleMovieEmbed(docs[0]));
								}
							});
						} else {
							return message.channel.send(main.buildSingleMovieEmbed(docs[0]));
						}
					}
				});
			}
		});
	},
};