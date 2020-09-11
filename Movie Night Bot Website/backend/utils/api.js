const fetch = require('node-fetch');
const DISCORD_API = 'http://discord.com/api/v6';
const User = require('../database/schemas/User');
const GuildCount = require('../database/schemas/GuildCount');
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

async function getGuildCount() {
	const guildCount = await GuildCount.findOne({});

	return fetch('https://top.gg/api/bots/709271563110973451/stats', {
		method: 'GET',
		headers: {
			'Authorization': process.env.TOP_API
		}
	}).then(function(response) {
		if (response.status != 200) {
			console.log('Rate limited');
			
			return guildCount.get('count');
		} else {
			return response.json(); 
		}		
	}).then(function(data) {
		const count = (typeof data == 'number') ? data : data.server_count;

		GuildCount.findOneAndUpdate({}, { count: count }, {upsert: true}, function(err) {
			console.log(err);
		});
		
		return count;
	});
}

module.exports = { getUserGuilds, getGuildCount };