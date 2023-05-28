const axios = require("axios");
const DISCORD_API = "http://discord.com/api/v6";
const User = require("../database/schemas/User");
const GuildCount = require("../database/schemas/GuildCount");
const { decrypt } = require("./utils");
const CryptoJS = require("crypto-js");

async function getUserGuilds(discordID) {
	const user = await User.findOne({ discordID });

	if (!user) throw new Error("No Credentials.");

	const decryptedToken = decrypt(user.get("accessToken")).toString(CryptoJS.enc.Utf8);

	return axios
		.get(`${DISCORD_API}/users/@me/guilds`, {
			headers: {
				Authorization: `Bearer ${decryptedToken}`,
			},
		})
		.then(function (response) {
			User.updateOne({ discordID }, { guilds: response.data }).catch(() => {});

			return response.data;
		})
		.catch(function (error) {
			if (error.response.status == 429) {
				console.log("Rate limited");

				return user.get("guilds");
			}
		});
}

async function getGuildCount() {
	const guildCount = await GuildCount.findOne({});

	return axios
		.get("https://top.gg/api/bots/709271563110973451/stats", {
			headers: {
				Authorization: process.env.TOP_API,
			},
		})
		.then(function (response) {
			if (response.status != 200) {
				console.log("Rate limited");

				return guildCount.get("count");
			} else {
				return response.data;
			}
		})
		.then(function (data) {
			const count = typeof data == "number" ? data : data.server_count;

			GuildCount.findOneAndUpdate({}, { count: count }, { upsert: true }).catch(() => {});

			return count;
		})
		.catch(function (error) {
			if (error.response.status == 429) {
				console.log("Rate limited");

				return guildCount.get("count");
			}
		});
}

module.exports = { getUserGuilds, getGuildCount };
