const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
const { Client, Discord, GatewayIntentBits, Partials, Collection, EmbedBuilder, Options, LimitedCollection, ActivityType } = require("discord.js");
const moment = require("moment");
const mongoose = require("mongoose");
const { token, movieDbAPI, mongoLogin, topggAPI, testing, maxPollTime } = require("./config.json");
const client = new Client({
	intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.Guilds],
	allowedMentions: { parse: ["users", "roles"] }, // allowedMentions to prevent unintended role and everyone pings
});
const { AutoPoster } = require("topgg-autoposter");
// eslint-disable-next-line no-undef
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
const guildSettings = new Collection();
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Movie = new Schema({
	id: ObjectId,
	primaryKey: { type: String, unique: true },
	guildID: { type: String, index: true },
	movieID: String,
	imdbID: String,
	name: String,
	posterURL: String,
	overview: String,
	releaseDate: Date,
	runtime: Number,
	rating: Number,
	submittedBy: String,
	submitted: { type: Date, default: Date.now },
	viewed: { type: Boolean, default: false },
	viewedDate: { type: Date, default: null },
});
const Settings = new Schema({
	id: ObjectId,
	guildID: { type: String, unique: true, index: true },
	autoViewed: { type: Boolean, default: false },
	addMoviesRole: { type: String, default: null },
	pollRole: { type: String, default: null },
	deleteMoviesRole: { type: String, default: null },
	viewedMoviesRole: { type: String, default: null },
	//If deleteMoviesRole = null, allow only admins delete. = "all" then remove restrictions. If specific role then admins + role
});
const movieModel = mongoose.model("Movie", Movie);
const setting = mongoose.model("Settings", Settings);
let main;

if (!testing) {
	const poster = AutoPoster(topggAPI, client);

	poster.on('error', (err) => {
		console.error(err);
	})
}

client.commands = new Collection();
mongoose.connect(mongoLogin, { useNewUrlParser: true, useUnifiedTopology: true });

function setMessage() {
	client.user.setPresence({
		activities: [{ name: `Reinvite me for slash cmds!`, type: ActivityType.Watching }],
	});
}

client.once("ready", () => {
	//Every hour update activity to avoid getting it cleared.
	setMessage();
	setInterval(setMessage, 1000 * 60 * 60);
	console.log("Ready!");
});

function guildCreateError(err) {
	if (err) {
		console.error("Guild create", err);
	}
}

function handleError(err, message) {
	if (err) {
		console.error(message, err);
	}
}

function uncacheGuild(guild) {
	if (guild) guildSettings.delete(guild.id);
}

client.on("guildCreate", async function (guild) {
	//Whenever the bot is added to a guild, instantiate default settings into our database.
	new setting({ guildID: guild.id }).save().catch(guildCreateError);
});

client.on("guildDelete", function (guild) {
	//Whenever the bot is removed from a guild, we remove all related data.
	movieModel.deleteMany({ guildID: guild.id }).catch(handleError);
	setting.deleteMany({ guildID: guild.id }).catch(handleError);
});

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return uncacheGuild(interaction.guild);

	//Do not ask database for settings if we already have them stored, any updates to settings are handled within the settings modules.
	//Currently after commands we clear out guildSettings to avoid memory leaks with discord.js memory caching.
	if (interaction.guild && !guildSettings.has(interaction.guild.id)) {
		await getSettings(interaction.guildId).then(function (settings) {
			if (!settings) {
				//If no settings exist (during downtime of bot) we instantiate some settings before processing command.
				new setting({ guildID: interaction.guildId }).save().then((setting) => {
					guildSettings.set(interaction.guildId, setting);
				}).catch((err) => {
					console.error("Guild create", err);
				});
			} else {
				guildSettings.set(interaction.guildId, settings);
			}
		}).catch(() => {});
	}

	//Defaults in case mongoDB connection is down
	const settings = (interaction.guild ? guildSettings.get(interaction.guildId) : null) || {
		autoViewed: false,
		addMoviesRole: null,
	};

	//If no permissions
	if (interaction.guild && !interaction.channel.permissionsFor(client.application.id).has("SendMessages")) {
		uncacheGuild(interaction.guild);

		return await interaction.member
			.send(
				"This bot needs permissions for SENDING MESSAGES in the channel you've requested a command. Please update bots permissions for the channel to include: \nSEND MESSAGES, ADD REACTION, MANAGE MESSAGES, EMBED LINKS, READ MESSAGE HISTORY\nAdmins may need to adjust the hierarchy of permissions."
			)
			.catch((error) => {
				console.error(`Could not send help DM to ${interaction.member.tag}.\n`, error);
			});
	}

	if (interaction.guild && !interaction.channel.permissionsFor(client.application.id).has(["AddReactions", "ManageMessages", "EmbedLinks", "ReadMessageHistory"])) {
		uncacheGuild(interaction.guild);

		return await interaction.reply(
			"Bot cannot correctly run commands in this channel. \nPlease update bots permissions for this channel to include: \nSEND MESSAGES, ADD REACTION, MANAGE MESSAGES, EMBED LINKS, READ MESSAGE HISTORY\nAdmins may need to adjust the hierarchy of permissions."
		);
	}

	//Send message, arguments and additional functions/variables required to the command.
	try {
		console.log(command.data.name + " " + new Date());
		await interaction.deferReply();
		await command.execute(interaction, main, settings);
		uncacheGuild(interaction.guild);
	} catch (error) {
		console.error("Problem executing command", error);
		uncacheGuild(interaction.guild);

		return interaction.editReply({ content: "There was an error trying to execute that command!" });
	}
});

client.login(token);

//Movie can be string or IMDB link
function searchMovieDatabaseObject(guildID, movie, hideViewed) {
	let isImdbSearch = movie.includes("imdb.com");
	let searchObj = {
		guildID: guildID,
	};

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
	console.log(movie);
	const embed = new EmbedBuilder()
		.setTitle(movie.name)
		.setURL(`https://www.imdb.com/title/${movie.imdbID}`)
		.setDescription(movie.overview)
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

async function searchNewMovie(search, message) {
	let failedSearch = false;
	let data = false;
	let isImdbSearch = search.includes("imdb.com");
	let searchTerm = isImdbSearch ? search.match(/tt[0-9]{7,8}/g) : search;

	if (!searchTerm) {
		await message.channel.send("Please enter a valid search.");

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
		await message.channel.send("Couldn't find any movies. Sorry!");

		return [null, data];
	}

	let movie = new movieModel({
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

function getRandomFromArray(array, count) {
	for (let i = array.length - 1; i > 0; i--) {
		let index = Math.floor(Math.random() * (i + 1));
		[array[i], array[index]] = [array[index], array[i]];
	}

	return array.slice(0, count);
}

function getSettings(guildID) {
	return setting.findOne({ guildID: guildID }).exec();
}

//Namespace functions and variables for modules
main = {
	movieModel,
	searchMovieDatabaseObject,
	buildSingleMovieEmbed,
	searchNewMovie,
	setting,
	guildSettings,
	getRandomFromArray,
	client,
	maxPollTime, //Testing 24 hour polls on GCloud
};
