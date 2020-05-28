/*
	TODOS
	1. Check for TIES
	2. Add reaction check if user wants to delete all movies
*/
const fs = require("fs");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const moment = require("moment");
const mongoose = require("mongoose");
const { prefix, token, movieDbAPI, mongoLogin } = require("./config.json");
const client = new Discord.Client();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const cooldowns = new Discord.Collection();
const guildSettings = new Discord.Collection();
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
	viewedDate: { type: Date, default: null }
});
const Settings = new Schema({
	id: ObjectId,
	guildID: { type: String, unique: true, index: true },
	prefix: { type: String, default: "--" },
	pollTime: { type: Number, default: 60000 },
	pollMessage: { type: String, default: "Poll has begun!" },
	pollSize: { type: Number, min: 1, max: 10, default: 10 },
	autoViewed: { type: Boolean, default: false },
	addMoviesRole: { type: String, default: null }
});
const movieModel = mongoose.model("Movie", Movie);
const setting = mongoose.model("Settings", Settings);
var main = {};

client.commands = new Discord.Collection();
mongoose.connect(mongoLogin, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

client.once("ready", () => {
	//Every hour update activity to avoid getting it cleared.
	setInterval(function() {
		client.user.setActivity("movies with friends at https://movienightbot.xyz/", { type: "WATCHING" });
	}, 1000 * 60 * 60 ); 
	console.log("Ready!");
});

client.on("guildCreate", async function(guild) {
	//Whenever the bot is added to a guild, instantiate default settings into our database. 
	new setting({guildID: guild.id}).save(function(err) {
		if (err) {
			console.log("Guild create", err);
			client.message.send("Could not create settings.");
		}
	});
});

client.on("guildDelete", function(guild) {
	movieModel.deleteMany({ guildID: guild.id }, handleError);
	setting.deleteMany({ guildID: guild.id }, handleError);
});


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}

client.on("message", async function(message) {	
	var guildID = message.guild ? message.guild.id : -1;

	//Do not ask database for settings if we already have them stored, any updates to settings are handled within the settings modules.
	if (message.guild && !guildSettings.has(message.guild.id)) {
		await getSettings(message.guild.id).then(function(settings) {
			guildSettings.set(message.guild.id, settings);
		});
	}

	var settings = guildSettings.get(guildID) || {};
	var currentPrefix = settings.prefix || prefix;

	//If message doesn't have the prefix from settings, ignore the message.
	if (!message.content.startsWith(currentPrefix) || message.author.bot) return;

	const args = message.content.slice(currentPrefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 0) * 1000;

	if (command.name != "help" && message.channel.type !== "text") {
		return message.reply("I can't execute that command inside DMs!");
	}

	//If the command has been flagged as admin only, do not process it.
	if (command.admin && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("This commands requires the user to have an administrator role in the server.");
	
	//Tell user usage if command has been flagged as an argument based command.
	if (command.args && !args.length) {
		var reply = `Incorrect command usage., ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${currentPrefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	//Handle cooldowns on command.
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;

			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	//Send message, arguments and additional functions/variables required to the command.
	try {
		command.execute(message, args, main);
	} catch (error) {
		console.log(error);
		message.reply("There was an error trying to execute that command!");
	}
});

client.login(token);

function handleError(err, message) {
	if (err) {
		console.log(message);
	}
}

//Movie can be string or IMDB link
function searchMovieDatabaseObject(guildID, movie, hideViewed) {
	var searchObj = {
		guildID: guildID
	};
	
	if (movie != "" && movie) {
		searchObj.name = new RegExp(".*" + movie + ".*", "i");
	}

	if (hideViewed) {
		searchObj.viewed = false;
	}

	return searchObj;
}

function buildSingleMovieEmbed(movie, subtitle) {
	var embed = new Discord.MessageEmbed()
		.setTitle(movie.name)
		.setURL(`https://www.imdb.com/title/${movie.imdbID}`)
		.setDescription(movie.overview)
		.setImage(movie.posterURL)
		.setColor("#6441a3")
		.addFields(
			{ name: "Release Date", value: moment(movie.releaseDate).format("DD MMM YYYY"), inline: true },
			{ name: "Runtime", value: movie.runtime + " Minutes", inline: true },
			{ name: "Rating", value: movie.rating, inline: true },
			{ name: "Submitted By", value: movie.submittedBy, inline: true },
			{ name: "Submitted On", value: moment(movie.submitted).format("DD MMM YYYY"), inline: true },
			{ name: "Viewed", value: movie.viewed ? moment(movie.viewedDate).format("DD MMM YYYY") : "No", inline: true }
		);

	if (subtitle) {
		embed.setAuthor(subtitle);
	}

	return embed;
}

async function searchNewMovie(search, message, callback) {
	var failedSearch = false;
	var data = false;
	var isImdbSearch = search.indexOf("imdb.com") > 0;
	var searchTerm = isImdbSearch ? (search.match(/tt[0-9]{7,8}/g) != null ? search.match(/tt[0-9]{7,8}/g) : null) : search;

	if (searchTerm == "" || !searchTerm) {
		message.channel.send("Please enter a valid search."); 

		return callback();
	}

	//If not a IMDB link, do a general search else we use a different endpoint.
	var initialData = !isImdbSearch ? await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${movieDbAPI}&query=${encodeURIComponent(searchTerm)}&page=1`).then(response => response.json()) : await fetch(`https://api.themoviedb.org/3/find/${encodeURIComponent(searchTerm)}?api_key=${movieDbAPI}&external_source=imdb_id`).then(response => response.json());

	if (!initialData || initialData.total_results == 0 || (initialData.movie_results && initialData.movie_results.length == 0)) {
		failedSearch = true;
	}

	//Get the FIRST result from the initial search
	if (!failedSearch) {
		data = await fetch(`https://api.themoviedb.org/3/movie/${isImdbSearch ? initialData.movie_results[0].id : initialData.results[0].id}?api_key=${movieDbAPI}`).then(response => response.json());
	}

	if (!data || failedSearch) {
		message.channel.send("Couldn't find any movies. Sorry!");

		return callback(null, data);
	} 

	callback(new movieModel({
		primaryKey: message.guild.id + data.id,
		guildID: message.guild.id,
		movieID: data.id,
		imdbID: data.imdb_id,
		name: data.original_title,
		posterURL: `https://image.tmdb.org/t/p/original/${data.poster_path}`,
		overview: data.overview,
		releaseDate: new Date(data.release_date),
		runtime: data.runtime,
		rating: data.vote_average,
		submittedBy: message.member.user
	}), initialData);
}

function getRandomFromArray(array, count) {
	const shuffled = array.sort(() => 0.5 - Math.random());

	return shuffled.slice(0, count);
}

function getSettings(guildID) {
	return setting.findOne({guildID: guildID }).exec();
}

//Namespace functions and variables for modules
main.movieModel = movieModel;
main.searchMovieDatabaseObject = searchMovieDatabaseObject;
main.buildSingleMovieEmbed = buildSingleMovieEmbed;
main.searchNewMovie = searchNewMovie;
main.setting = setting;
main.guildSettings = guildSettings;
main.getRandomFromArray = getRandomFromArray;
main.client = client;