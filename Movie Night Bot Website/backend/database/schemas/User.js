const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	discordID: { type: String, required: true, unique: true },
	discordTag: { type: String, required: true },
	avatar: { type: String, required: true },
	guilds: { type: Array, required: true },
	accessToken: { type: String, required: true },
	refreshToken: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);