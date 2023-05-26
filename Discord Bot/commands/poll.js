const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Movie, Poll } = require("../../Models/schema");
const { testing } = require("./../config.json");
const { buildAndPostListEmbed, getRandomFromArray, movieSearchOptionsForDb } = require("../helpers/helperFunctions");
const moment = require("moment");
const emojis = require("../emojis.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("Begins a poll with a random assortment of movies depending on length of setting for poll size.")
		.addIntegerOption((option) => option.setName("size").setDescription("Number of movies included in the poll. Max is 10"))
		.addStringOption((option) => option.setName("message").setDescription("Sets the message that will be sent for the poll."))
		.addIntegerOption((option) => option.setName("time").setDescription("How long in MINUTES the poll will last. Default is 60"))
		.addStringOption((option) =>
			option.setName("multiplevotes").setDescription("Whether or not votes for multiple options are allowed or not.").addChoices({ name: "Enforce one vote per member", value: "disallow" }, { name: "Allow Multiple", value: "allow" })
		),
	async execute(interaction, settings) {
		const voteMenuOptions = [];
		let votes = {};
		let searchOptions = movieSearchOptionsForDb(interaction.guild.id, "", true); //["300", "Interstellar", "Tissue"], true);//"", true);
		let movieCount = 1;
		const pollSize = (interaction.options.getInteger("size") || 5) <= 10 ? interaction.options.getInteger("size") || 5 : 10;
		const pollTimeInMinutes = interaction.options.getInteger("time") || 60;
		const pollAnnounceMessage = interaction.options.getString("message") || "Poll has begun!";
		const multipleVotes = interaction.options.getString("multiplevotes") || "disallow";

		//Check if user has set a role for "Add" permissions, as only admins and this role will be able to add movies if set.
		if (!interaction.member.permissions.has("Administrator") && settings.pollRole != "all" && (!settings.pollRole || !interaction.member.roles.cache.has(settings.pollRole))) {
			return await interaction.editReply(`Polls can only be started by administrators or users with the ${settings.pollRole ? `role <@&${settings.pollRole}>` : "a set role using the `pollrole` command."}`);
		}

		await interaction.editReply(pollAnnounceMessage);

		//2048 limit
		const docs = await Movie.find(searchOptions);

		if (!docs.length) {
			return await interaction.followUp("Cannot start poll. List of unviewed movies is empty.");
		} else if (docs && docs.length) {
			//Gets random assortment of movies depending on poll size setting and number of movies in the servers list.
			let movies = getRandomFromArray(docs, pollSize);

			for (let movie of movies) {
				voteMenuOptions.push(new ButtonBuilder().setLabel("0").setCustomId(`${movieCount}`).setStyle(ButtonStyle.Secondary).setEmoji(emojis[movieCount]));
				votes[movieCount] = { voters: [], movieID: movie.movieID, movieName: movie.name };
				movieCount++; //Store position of movie in list.
			}

			const embeddedMessage = await buildAndPostListEmbed(movies, "Poll has begun!", interaction, { emojiMode: true, returnFinalEmbedWithoutPosting: true });

			const row1 = new ActionRowBuilder().addComponents(voteMenuOptions.slice(0, 5));
			const components = [row1];
			const endTime = moment().add(pollTimeInMinutes, "m").set("ms", 0);

			if (voteMenuOptions.slice(5, 10).length != 0) {
				components.push(new ActionRowBuilder().addComponents(voteMenuOptions.slice(5, 10)));
			}

			embeddedMessage.setFooter({ text: `Poll will end ${endTime.format("DD MMM YYYY HH:mm")} UTC time` });

			let pollMessage = await interaction.followUp({
				embeds: [embeddedMessage],
				components: components,
			});

			await Poll.create({
				guildID: interaction.guildId,
				messageID: pollMessage.id,
				channelID: pollMessage.channelId,
				votes: votes,
				endDateTime: moment().add(pollTimeInMinutes, "m").set("ms", 0),
				ended: false,
				allowMultipleVotes: multipleVotes == "allow",
				testEnvironment: testing,
			});
		}

		return;
	},
};
