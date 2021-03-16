const emojis = require("../emojis.json");

module.exports = {
	name: "remove",
	description: "Removes all unviewed movies from servers list if no movie specified, if movie specified then will delete that specific unviewed movie.",
	aliases: ["delete", "clear"],
	usage: "[movie name for specific delete, else just the command]",
	//admin: true, --WE don't use admin tag here as user should be able to remove their own movies before viewing.
	async execute(message, args, main, settings) {
		if (!args.length) {
			if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Sorry, only Administrators can delete all movies.");

			return message.channel.send("Are you sure you want to remove all unviewed movies?").then(async botMessage => {
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
						return main.movieModel.deleteMany({ guildID: message.guild.id, viewed: false }, err => {
							if (!err) {
								return message.channel.send("All movies have been deleted.");
							} else {
								return message.channel.send("An error occured while trying to delete all movies");
							}
						});
					} else {
						return message.channel.send("No movies have been deleted.");
					}
				}).catch(async () => {
					return message.channel.send("Couldn't get your response.");
				});
			});
		}

		const searchOptions = main.searchMovieDatabaseObject(message.guild.id, args.join(" "), true);

		//If submitted film is by member trying to delete, allow it.
		if (args.join(" ")) {
			return main.movieModel.findOne(searchOptions, (err, movie) => {
				console.log(settings.deleteMoviesRole && (message.member.roles.cache.has(settings.deleteMoviesRole) || settings.deleteMoviesRole == "all"))
				console.log(settings.deleteMoviesRole);
				console.log(message.member.roles.cache.has(settings.deleteMoviesRole));

				if (err || !movie) {
					return message.channel.send("Movie could not be found! It may be in the viewed list. Use removeviewed instead.");
				} else if ("<@" + message.member.user.id + ">" === movie.submittedBy || (settings.deleteMoviesRole && (message.member.roles.cache.has(settings.deleteMoviesRole) || settings.deleteMoviesRole == "all")) || message.member.hasPermission("ADMINISTRATOR")) {
					return message.channel.send(`Are you sure you want to delete ${movie.name}?`).then(async botMessage => {
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
								return movie.remove(err => {
									if (!err) {
										return message.channel.send(`Movie deleted: ${movie.name}`);
									} else {
										return message.channel.send("Could not remove movie, something went wrong.");
									}
								});
							} else {
								return message.channel.send(`${movie.name} has not been deleted.`);
							}
						}).catch(async () => {
							return message.channel.send("Couldn't get your response.");
						});
					});
				} else {
					return message.channel.send("Non-administrators can only delete movies they have submitted, unless deleterole has been set to all or a specific role.");
				}
			});
		} else {
			return message.channel.send("Specify a movie or remove space.");
		}
	},
};