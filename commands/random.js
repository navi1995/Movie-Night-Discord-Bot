module.exports = {
	name: 'random',
	description: 'Returns a random movie from the servers list of films to watch.',
	aliases: ['getrandom', 'getone', 'randommovie'],
	execute(message, args, main) {
		return main.movieModel.count({guildID: message.guild.id }, function(err, count) {
			if (!err) {
				var random = Math.floor(Math.random() * count);
				var searchOptions = main.searchMovieDatabaseObject(message.guild.id, "");

				main.movieModel.find(searchOptions).skip(random).limit(1).exec(function (error, docs) {
					if (docs && docs.length > 0) {
						message.channel.send(main.buildSingleMovieEmbed(docs[0]));
					}
				});
			}
		});
	},
};