const emojis = require("../emojis.json");

module.exports = {
	name: "setviewed",
	description: "Toggles specified movie as viewed.",
	usage: "[Movie name to set as viewed]",
	args: true,
	//admin: true,
	async execute(message, args, main, settings) {
		const searchOptions = main.searchMovieDatabaseObject(message.guild.id, args.join(" "));

		return main.movieModel.findOne(searchOptions, (err, movie) => {
			if (err || !movie) {
				return message.channel.send("Movie could not be found!");
			} else if ((settings.viewedMoviesRole && (message.member.roles.cache.has(settings.viewedMoviesRole) || settings.viewedMoviesRole == "all")) || message.member.hasPermission("ADMINISTRATOR")){
				return message.channel.send(`Are you sure you want to set ${movie.name} to ${!movie.viewed ? "" : "un"}viewed?`).then(async botMessage => {
					const filter = (reaction, user) => [emojis.yes, emojis.no].includes(reaction.emoji.name) && user.id == message.author.id;
	
					try {
						await botMessage.react(emojis.yes);
						await botMessage.react(emojis.no);
					} catch (e) {
						console.log("Message deleted");
					}
					
					//Wait for user to confirm if movie presented to them is what they wish to be added to the list or not.								
					return botMessage.awaitReactions(filter, { max: 1, time: 15000, errors: ["time"] }).then(async collected => {
						const reaction = collected.first();
	
						if (reaction.emoji.name == emojis.yes) {
							return movie.updateOne({ viewed: !movie.viewed, viewedDate: movie.viewed ? null : new Date() }, err => {
								if (!err) {
									return message.channel.send(`${movie.name} has been set to ${!movie.viewed ? "" : "un"}viewed!`);
								} else {
									return message.channel.send("Could not set movie to viewed, something went wrong.");
								}
							});
						} else {
							return message.channel.send(`${movie.name} has NOT been set to ${!movie.viewed ? "" : "un"}viewed.`);
						}
					}).catch(async () => {
						return message.channel.send("Couldn't get your response.");
					});
				});
			} else {
				return message.channel.send("Non-administrators can only set viewed if viewedrole has been set to all or a specific role.");
			}
		});
	},
};