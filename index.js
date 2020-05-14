/*
	TODOS/Approach
	1. Running polls, grab random 10 movies from list and gather reacts, if repoll react hit with admin then re-roll.fail
	2. Delete specific movie
	3. Confirmation if search results > 1?
	4. Allow IMDB links to be submitted
	5. Move commands into self files
	6. Roulette mode
	7. Auto-delete mode
	8. Test duplicates
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
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Movie = new Schema({
	id: ObjectId,
	guildID: {type: String, index: true },
	movieID: String,
	imdbID: String,
	name: String,
	posterURL: String,
	overview: String,
	releaseDate: Date,
	runtime: Number,
	rating: Number,
	submittedBy: String,
	submitted: { type: Date, default: Date.now }
});
const movieModel = mongoose.model("Movie", Movie);

client.commands = new Discord.Collection();
mongoose.connect(mongoLogin);

client.once("ready", () => {
	console.log("Ready!");
});

client.on("guildDelete", async guild => {
	movieModel.deleteMany({guildID: guild.id}, handleError);
});


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}

client.on("message", async message => {
	if (message.guild && message.content == "get") {
		//10 limit embeds per image
		const movieEmbed = new Discord.MessageEmbed().setTitle("Submitted Movies");
		var number = 1;
		var description = "";

		//25 embed limit for fields
		movieModel.find({}, function (error, docs) {
			if (docs && docs.length > 0) {
				docs.forEach(function(movie) {
					description += `**[${number}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by ${movie.submittedBy} on ${moment(movie.submitted).format("DD MMM YYYY")}\n
						**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;
					number++;
				});
			}

			movieEmbed.setDescription(description);
			message.channel.send(movieEmbed);		
		});
	}

	if (message.guild && message.content == "deleteall") {
		movieModel.deleteMany({guildID: message.guild.id}, handleError);
	}

	if (message.guild && message.content.startsWith("testsearch")) {
		var failedSearch = false;
		var data = false;
		var initialData = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${movieDbAPI}&query=${encodeURIComponent(message.content.replace("testsearch", "").trimStart())}&page=1`).then(response => response.json());

		if (!initialData || initialData.total_results == 0) {
			failedSearch = true;
		}

		if (!failedSearch) {
			data = await fetch(`https://api.themoviedb.org/3/movie/${initialData.results[0].id}?api_key=${movieDbAPI}`).then(response => response.json());
		}

		if (!data || failedSearch) {
			message.channel.send("Couldn't find any movies. Sorry!");
			return;
		} 

		const newMovie = new movieModel({
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
		});
		
		newMovie.save(function(err) {
			handleError(err, "Couldn't add movie.");

			if (!err) {
				const movieEmbed = new Discord.MessageEmbed()
					.setAuthor("Movie Added!")
					.setTitle(newMovie.name)
					.setURL(`https://www.imdb.com/title/${newMovie.imdb_id}`)
					.setDescription(newMovie.overview)
					.setThumbnail(newMovie.posterURL)
					.addFields(
						{ name: "Release Date", value: moment(newMovie.releaseDate).format("DD MMM YYYY"), inline: true },
						{ name: "Runtime", value: newMovie.runtime + " Minutes", inline: true },
						{ name: "Rating", value: newMovie.rating, inline: true },
						{ name: "Submitted By", value: newMovie.submittedBy, inline: true }
					)

				message.channel.send(movieEmbed);
			}
		});
	}

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (!command) return;

	if (command.name != "help" && message.channel.type !== "text") {
		return message.reply("I can't execute that command inside DMs!");
	}
	
	if (command.args && !args.length) {
		var reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;

			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		message.reply("There was an error trying to execute that command!");
	}
});

client.login(token);

function handleError(err, message) {
	if (err) {
		console.log(message);
	}
}