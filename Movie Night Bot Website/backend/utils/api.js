const fetch = require('node-fetch');
const DISCORD_API = 'http://discord.com/api/v6';
const User = require('../database/schemas/User');
const { decrypt } = require('./utils');
const CryptoJS = require('crypto-js');

async function getUserGuilds(discordID) {
	const user = await User.findOne({ discordID });
	if (!user) throw new Error("No Credentials.");

	const decryptedToken = decrypt(user.get('accessToken')).toString(CryptoJS.enc.Utf8);
	const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${decryptedToken}`
		}
	});

	return response.json();
}

module.exports = { getUserGuilds };