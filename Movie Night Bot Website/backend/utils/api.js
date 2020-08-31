const fetch = require('node-fetch');
const DISCORD_API = 'http://discord.com/api/v6';
const User = require('../database/schemas/User');
const { decrypt } = require('./utils');
const CryptoJS = require('crypto-js');

async function getUserGuilds(discordID) {
	const user = await User.findOne({ discordID });

	if (!user) throw new Error('No Credentials.');

	const decryptedToken = decrypt(user.get('accessToken')).toString(CryptoJS.enc.Utf8);
	
	return fetch(`${DISCORD_API}/users/@me/guilds`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${decryptedToken}`
		}
	}).then(function(response) {
		if (response.status == 429) {
			console.log('Rate limited');
			
			return user.get('guilds');
		} else {
			return response.json(); 
		}		
	}).then(function(data) {
		User.updateOne({ discordID }, { guilds: data }, function(err) {
			console.log(err);
		});
		
		return data;
	});
}

module.exports = { getUserGuilds };