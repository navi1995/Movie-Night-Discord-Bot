const fs = require("node:fs");
const path = require("node:path");
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const moment = require("moment");
const mongoose = require("mongoose");
const { token, mongoLogin, topggAPI, testing } = require("./config.json");
const client = new Client({
	shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
	allowedMentions: { parse: ["users", "roles"] }, // allowedMentions to prevent unintended role and everyone pings
});
const { AutoPoster } = require("topgg-autoposter");
// eslint-disable-next-line no-undef
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
// eslint-disable-next-line no-undef
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
client.cluster = new ClusterClient(client);

if (!testing) {
	const poster = AutoPoster(topggAPI, client);

	poster.getStats = async () => {
		const response = await client.cluster.fetchClientValues('guilds.cache.size');

		return {
			serverCount: response.reduce((a, b) => a + b, 0),
			shardCount: client.cluster.info.TOTAL_SHARDS
		}
	}

	poster.on("error", (err) => {
		console.error(err);
	});
}

client.commands = new Collection();
mongoose.connect(mongoLogin, { useNewUrlParser: true, useUnifiedTopology: true });

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);
