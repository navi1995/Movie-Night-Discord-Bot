const { Events } = require('discord.js');
const cron = require("node-cron");
const moment = require("moment");
const { Movie, Poll, Setting } = require("../../Models/schema");
const { testing } = require("./../config.json");
const { buildSingleMovieEmbed } = require("../helpers/helperFunctions");

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		cron.schedule("* * * * *", async () => {
			const polls = await Poll.find({ ended: false, endDateTime: { $lte: moment() }, testEnvironment: testing });
			console.log(polls);

			polls.forEach(async (poll) => {
				try {
					// var ch = client.channels.cache.get(poll.channelID);
					var ch = await client.channels.fetch(poll.channelID);

					if (ch) {
						console.log("Processing poll", poll.id)
						var msg = await ch.messages.fetch(poll.messageID);
						let message = "";
						const maxCount = Object.values(poll.votes).reduce((max, value) => Math.max(max, value.voters.length), 0);
						const maxKeys = Object.keys(poll.votes).filter((key) => poll.votes[key].voters.length === maxCount);

						if (maxCount == 0) {
							await msg.reply("No votes were made, so no winner has been chosen.");
							return await poll.updateOne({ ended: true });
						}

						if (maxKeys.length > 1) {
							message = "A tie was found! A random winner from them will be chosen. ";
						}

						var movieID = poll.votes[maxKeys[0]].movieID;

						const movie = await Movie.findOne({ guildID: poll.guildID, movieID: movieID });
						const settings = await Setting.findOne({ guildID: poll.guildID });

						if (settings.autoViewed) {
							await movie.updateOne({ viewed: true, viewedDate: new Date() });
						}

						await msg.reply({ embeds: [buildSingleMovieEmbed(movie, message + `A winner has been chosen! ${movie.name} with ${maxCount} votes.`)] });

						return await poll.updateOne({ ended: true });
					}
				} catch (err) {							
					try {
						await ch.send("Could not post poll results due to some issue. Did you delete the original poll?");
					} catch (err) { console.log("Couldn't post about failed poll."); }

					console.log("Error in posting poll results.", err);

					await poll.deleteOne();
				}
			});
		});
	},
};