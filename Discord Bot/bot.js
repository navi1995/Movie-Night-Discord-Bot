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
const { prefix, token, movieDbAPI, mongoLogin, topggAPI, testing, maxPollTime } = require("./config.json");
const client = new Discord.Client({
	messageCacheMaxSize: 500,
	messageCacheLifetime: maxPollTime + 100, //Maximum poll time = 7200, ensure message not swept.
	messageSweepInterval: 600,
	allowedMentions: { parse: ['users'] }, // allowedMentions to prevent unintended role and everyone pings
	disabledEvents: [
		'GUILD_UPDATE'
		,'GUILD_MEMBER_ADD'
		,'GUILD_MEMBER_REMOVE'
		,'GUILD_MEMBER_UPDATE'
		,'GUILD_MEMBERS_CHUNK'
		,'GUILD_ROLE_CREATE'
		,'GUILD_ROLE_DELETE'
		,'GUILD_ROLE_UPDATE'
		,'GUILD_BAN_ADD'
		,'GUILD_BAN_REMOVE'
		,'GUILD_EMOJIS_UPDATE'
		,'GUILD_INTEGRATIONS_UPDATE'
		,'CHANNEL_CREATE'
		,'CHANNEL_DELETE'
		,'CHANNEL_UPDATE'
		,'CHANNEL_PINS_UPDATE'
		,'MESSAGE_CREATE'
		,'MESSAGE_DELETE'
		,'MESSAGE_UPDATE'
		,'MESSAGE_DELETE_BULK'
		,'MESSAGE_REACTION_REMOVE'
		,'MESSAGE_REACTION_REMOVE_ALL'
		,'USER_UPDATE'
		,'PRESENCE_UPDATE'
		,'TYPING_START'
		,'VOICE_STATE_UPDATE'
		,'VOICE_SERVER_UPDATE'
		,'WEBHOOKS_UPDATE'
	]
});
const DBL = require("dblapi.js");
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
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
	addMoviesRole: { type: String, default: null },
	pollRole: { type: String, default: null },
	deleteMoviesRole: { type: String, default: null },
	viewedMoviesRole: { type: String, default: null }
	//If deleteMoviesRole = null, allow only admins delete. = "all" then remove restrictions. If specific role then admins + role
});
const movieModel = mongoose.model("Movie", Movie);
const setting = mongoose.model("Settings", Settings);
let main;

if (!testing) {
	const dbl = new DBL(topggAPI, client);
}

client.commands = new Discord.Collection();
client.commandsArray = [];
mongoose.connect(mongoLogin, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

function setMessage() {
	client.user.setActivity("at https://movienightbot.xyz/", { type: "WATCHING" });
}

client.once("ready", () => {
	//Every hour update activity to avoid getting it cleared.
	setMessage();
	setInterval(setMessage, 1000 * 60 * 60 );
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

client.on("guildCreate", async function(guild) {
	//Whenever the bot is added to a guild, instantiate default settings into our database. 
	new setting({ guildID: guild.id }).save(guildCreateError);
});

client.on("guildDelete", function(guild) {
	//Whenever the bot is removed from a guild, we remove all related data.
	movieModel.deleteMany({ guildID: guild.id }, handleError);
	setting.deleteMany({ guildID: guild.id }, handleError);
});


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
	client.commandsArray.push(command.name);

	//We don't really care about duplicates, merge alias' into commands array
	if (command.aliases) {
		Array.prototype.push.apply(client.commandsArray, command.aliases);
	}
}

client.on("message", async function(message) {	
	if (message.author.bot) return;

	//Put in a check for all commands and aliases, if not apart of message dont continue
	if (!client.commandsArray.some(commandText=>message.content.includes(commandText))) {
		return;
	}

	//Do not ask database for settings if we already have them stored, any updates to settings are handled within the settings modules.
	//Currently after commands we clear out guildSettings to avoid memory leaks with discord.js memory caching.
	if (message.guild && !guildSettings.has(message.guild.id)) {
		await getSettings(message.guild.id).then(function(settings) {
			if (!settings) {
				//If no settings exist (during downtime of bot) we instantiate some settings before processing command.
				new setting({ guildID: message.guild.id }).save(function(err, setting) {
					if (err) {
						console.error("Guild create", err);
					} else {
						guildSettings.set(message.guild.id, setting);
					}
				});
			} else {
				guildSettings.set(message.guild.id, settings);
			}
		});
	}

	//Defaults in case mongoDB connection is down
	const settings = (message.guild ? guildSettings.get(message.guild.id) : null) || {
		prefix: prefix || '--',
		pollTime: "60000",
		pollMessage: "Poll has begun!",
		pollSize: 10,
		autoViewed: false,
		addMoviesRole: null
	};
	const currentPrefix = settings.prefix || prefix;

	//If bot cant SEND MESSAGES, try to DM. If not then bots broken.
	//ADDS_REACTIONS needed for ADD and POLL
	//SEND_MESSAGES needed for ALL
	//MANAGE_MESSAGES needed for POLL
	//EMBED LINKS needed for SEARCH/ADD/POLL
	//READ_MESSAGES needed for all.

	//If message doesn't have the prefix from settings, ignore the message.
	if (!message.content.startsWith(currentPrefix) || message.author.bot) return uncacheGuild(message.guild);

	const args = message.content.slice(currentPrefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return uncacheGuild(message.guild);

	if (command.name != "help" && message.channel.type === "dm") {
		return message.reply("I can't execute that command inside DMs!");
	}

	//If no permissions
	if (message.guild && !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
		uncacheGuild(message.guild);

		return message.author.send("This bot needs permissions for SENDING MESSAGES in the channel you've requested a command. Please update bots permissions for the channel to include: \nSEND MESSAGES, ADD REACTION, MANAGE MESSAGES, EMBED LINKS, READ MESSAGE HISTORY\nAdmins may need to adjust the hierarchy of permissions.")
			.catch(error => {
				console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
		});
	}

	//If the command has been flagged as admin only, do not process it.
	if (command.admin && !message.member.hasPermission("ADMINISTRATOR")) {
		uncacheGuild(message.guild);

		return message.channel.send("This commands requires the user to have an administrator role in the server.");
	}

	if (message.guild && !message.channel.permissionsFor(message.guild.me).has(["ADD_REACTIONS", "MANAGE_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY"])) {
		uncacheGuild(message.guild);
		
		return message.reply("Bot cannot correctly run commands in this channel. \nPlease update bots permissions for this channel to include: \nSEND MESSAGES, ADD REACTION, MANAGE MESSAGES, EMBED LINKS, READ MESSAGE HISTORY\nAdmins may need to adjust the hierarchy of permissions.");
	}
	
	//Tell user usage if command has been flagged as an argument based command.
	if (command.args && !args.length) {
		uncacheGuild(message.guild);

		return message.channel.send(`Incorrect command usage, ${message.author}!${command.usage ? `\nThe proper usage would be: \`${currentPrefix}${command.name} ${command.usage}\`` : ''}`);
	}

	//Send message, arguments and additional functions/variables required to the command.
	try {
		console.log(command.name + " " + new Date());
		await command.execute(message, args, main, settings);
		uncacheGuild(message.guild);
	} catch (error) {
		console.error("Problem executing command", error);
		uncacheGuild(message.guild);

		return message.reply("There was an error trying to execute that command!");
	}
});

client.login(token);

//Movie can be string or IMDB link
function searchMovieDatabaseObject(guildID, movie, hideViewed) {
	let searchObj = {
		guildID: guildID
	};
	
	if (movie) {
		searchObj.name = new RegExp(".*" + movie + ".*", "i");
	}

	if (hideViewed) {
		searchObj.viewed = false;
	}

	return searchObj;
}

function buildSingleMovieEmbed(movie, subtitle, hideSubmitted) {
	const embed = new Discord.MessageEmbed()
		.setTitle(movie.name)
		.setURL(`https://www.imdb.com/title/${movie.imdbID}`)
		.setDescription(movie.overview)
		.setImage(movie.posterURL)
		.setColor("#6441a3")
		.addFields(
			{ name: "Release Date", value: moment(movie.releaseDate).format("DD MMM YYYY"), inline: true },
			{ name: "Runtime", value: movie.runtime + " Minutes", inline: true },
			{ name: "Rating", value: movie.rating, inline: true }
		);

	if (!hideSubmitted) {
		embed.addFields(
			{ name: "Submitted By", value: movie.submittedBy, inline: true },
			{ name: "Submitted On", value: moment(movie.submitted).format("DD MMM YYYY"), inline: true },
			{ name: "Viewed", value: movie.viewed ? moment(movie.viewedDate).format("DD MMM YYYY") : "No", inline: true }
		);
	}

	if (subtitle) {
		embed.setAuthor(subtitle);
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
	let initialData = await (!isImdbSearch ? fetch(`https://api.themoviedb.org/3/search/movie?api_key=${movieDbAPI}&query=${encodeURIComponent(searchTerm)}&page=1`).then(response => response.json()) : fetch(`https://api.themoviedb.org/3/find/${encodeURIComponent(searchTerm)}?api_key=${movieDbAPI}&external_source=imdb_id`).then(response => response.json()));

	failedSearch = !initialData || initialData.total_results == 0 || (initialData.movie_results && initialData.movie_results.length == 0);

	//Get the FIRST result from the initial search
	if (!failedSearch) {
		data = await fetch(`https://api.themoviedb.org/3/movie/${isImdbSearch ? initialData.movie_results[0].id : initialData.results[0].id}?api_key=${movieDbAPI}`).then(response => response.json());
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
		submittedBy: message.member.user //message.author.id - Update to this after creating mongoDB migration and API for dashboard can be rolled out.
	});

	if (!isNaN(data.release_date)) {
		movie.releaseDate = new Date(data.release_date);
	}

	return [movie, initialData];
}

function getRandomFromArray(array, count) {
	for(let i = array.length - 1; i > 0; i--) {
		let index = Math.floor(Math.random() * (i + 1));
		[array[i], array[index]] = [array[index], array[i]];
	}  

	return array.slice(0, count);
}

function getSettings(guildID) {
	return setting.findOne({guildID: guildID }).lean().exec();
}

/*
function syncUpAfterDowntime() {
	setting.find({}).exec(function(err, docs) { 
		let missingSettings = Array.from(client.guilds.cache.keys()).filter(function(val) {
			return docs.map(a => a.guildID).includes(val);
		});
		missingSettings = missingSettings.map(function(a) {
			return { "guildID": a };
		});
		
		setting.insertMany(missingSettings, function(error, docs) {
			if (error) console.log(error);
		});
	});
}
*/

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
	maxPollTime //Testing 24 hour polls on GCloud
}