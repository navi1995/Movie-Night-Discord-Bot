const CryptoJS = require('crypto-js');

function encrypt(token) {
	return CryptoJS.AES.encrypt(token, process.env.SESSION_SECRET);
}

function decrypt(token) {
	return CryptoJS.AES.decrypt(token, process.env.SESSION_SECRET);
}

function hasDeletePermissions(user, guildID, movie) {
	const userGuilds = user.get('guilds');
	const userGuild = userGuilds.find(guild => guild.id == guildID);

	//Update to movie.submittedBy when mongodb migration created.
	return (userGuild && ((userGuild.permissions_new & 0x00000008) == 0x00000008 || movie.submittedBy.replace("<@", "").replace(">", "") == user.discordID));
}

function isUserInGuild(user, guildID) {
	const userGuilds = user.get('guilds');
	const userGuildIDs = userGuilds.map(guild => guild.id);

	return userGuildIDs.includes(guildID);
}

module.exports = { encrypt, decrypt, hasDeletePermissions, isUserInGuild };