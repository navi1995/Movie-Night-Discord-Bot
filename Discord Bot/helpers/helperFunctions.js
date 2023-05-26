const axios = require("axios");
const { movieDbAPI } = require("../config.json");
const { Movie } = require("../../Models/schema");
const moment = require("moment");
const { EmbedBuilder } = require("discord.js");
const emojis = require("../emojis.json");

async function searchMovieApi(search, message) {
	let failedSearch = false;
	let data = false;
	let isImdbSearch = search.includes("imdb.com");
	let searchTerm = isImdbSearch ? search.match(/tt[0-9]{7,8}/g) : search;

	if (!searchTerm) {
		await message.editReply("Please enter a valid search.");

		return;
	}

	//If not a IMDB link, do a general search else we use a different endpoint.
	let initialData = await (!isImdbSearch
		? axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${movieDbAPI}&query=${encodeURIComponent(searchTerm)}&page=1`).then((response) => response.data)
		: axios.get(`https://api.themoviedb.org/3/find/${encodeURIComponent(searchTerm)}?api_key=${movieDbAPI}&external_source=imdb_id`).then((response) => response.data));

	failedSearch = !initialData || initialData.total_results == 0 || (initialData.movie_results && initialData.movie_results.length == 0);

	//Get the FIRST result from the initial search
	if (!failedSearch) {
		data = await axios.get(`https://api.themoviedb.org/3/movie/${isImdbSearch ? initialData.movie_results[0].id : initialData.results[0].id}?api_key=${movieDbAPI}`).then((response) => response.data);
	}

	if (!data || failedSearch || data.success == "false") {
		await message.editReply("Couldn't find any movies. Sorry!");

		return [null, data];
	}

	let movie = new Movie({
		primaryKey: message.guild.id + data.id,
		guildID: message.guild.id,
		movieID: data.id,
		imdbID: data.imdb_id,
		name: data.title || data.original_title,
		posterURL: `https://image.tmdb.org/t/p/original/${data.poster_path}`,
		overview: data.overview,
		runtime: data.runtime,
		rating: data.vote_average,
		submittedBy: message.member.user, //message.author.id - Update to this after creating mongoDB migration and API for dashboard can be rolled out.
	});

	if (isNaN(data.release_date)) {
		movie.releaseDate = new Date(data.release_date);
	}

	return [movie, initialData];
}

function movieSearchOptionsForDb(guildID, movie, hideViewed) {
	let isImdbSearch = movie.includes("imdb.com");
	let searchObj = {
		guildID: guildID,
	};

	// If Movie is array, do regex for every item
	if (isImdbSearch) {
		searchObj.imdbID = movie.match(/tt[0-9]{7,8}/g);
	} else if (movie) {
		searchObj.name = new RegExp(".*" + movie + ".*", "i");
	}

	if (hideViewed) {
		searchObj.viewed = false;
	}

	return searchObj;
}

function buildSingleMovieEmbed(movie, subtitle, hideSubmitted) {
	const embed = new EmbedBuilder()
		.setTitle(movie.name)
		.setURL(`https://www.imdb.com/title/${movie.imdbID}`)
		.setDescription(movie.overview || "No description.")
		.setImage(movie.posterURL)
		.setColor("#6441a3")
		.addFields([
			{ name: "Release Date", value: moment(movie.releaseDate).format("DD MMM YYYY"), inline: true },
			{ name: "Runtime", value: movie.runtime + " Minutes", inline: true },
			{ name: "Rating", value: movie.rating + "", inline: true },
		]);

	if (!hideSubmitted) {
		embed.addFields([
			{ name: "Submitted By", value: movie.submittedBy, inline: true },
			{ name: "Submitted On", value: moment(movie.submitted).format("DD MMM YYYY"), inline: true },
			{ name: "Viewed", value: movie.viewed ? moment(movie.viewedDate).format("DD MMM YYYY") : "No", inline: true },
		]);
	}

	if (subtitle) {
		embed.setAuthor({ name: subtitle });
	}

	return embed;
}

function getRandomFromArray(array, count) {
	for (let i = array.length - 1; i > 0; i--) {
		let index = Math.floor(Math.random() * (i + 1));
		[array[i], array[index]] = [array[index], array[i]];
	}

	return array.slice(0, count);
}

function hiddenReply(content) {
	return { content, ephemeral: true };
}

async function buildAndPostListEmbed(movies, title, interaction, settings) {
	settings = settings || {};
	let embeddedMessages = [];
	let number = 1;
	let description = "";
	let movieEmbed = new EmbedBuilder().setTitle(title).setColor("#6441a3");
	const emojiMode = settings.emojiMode || false;
	const returnFinalEmbed = settings.returnFinalEmbedWithoutPosting || false;

	for (let movie of movies) {
		let stringConcat = `**[${emojiMode ? emojis[number++] : number++}: ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n` +
			`**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} Minutes **Rating:** ${movie.rating}\n\n`;

		//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
		if (description.length + stringConcat.length > 2048) {
			movieEmbed.setDescription(description);
			embeddedMessages.push(movieEmbed);
			description = "";
			movieEmbed = new EmbedBuilder().setTitle(`${title} (Cont...)`).setColor("#6441a3");
		}

		description += stringConcat;
	}

	movieEmbed.setDescription(description);
	embeddedMessages.push(movieEmbed);

	let messagesCount = 0;

	for (let embeddedMessage of embeddedMessages) {
		if (returnFinalEmbed && messagesCount == embeddedMessages.length -1) {
			return embeddedMessage;
		}

		messagesCount == 0 ? await interaction.editReply({ embeds: [embeddedMessage] }) : await interaction.followUp({ embeds: [embeddedMessage] });
		messagesCount++;
	}
}

module.exports = {
	searchMovieApi,
	movieSearchOptionsForDb,
	buildSingleMovieEmbed,
	buildAndPostListEmbed,
	getRandomFromArray,
	hiddenReply,
};
