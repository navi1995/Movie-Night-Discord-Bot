const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;
const SettingsSchema = new mongoose.Schema({
	id: ObjectId,
	guildID: { type: String, unique: true, index: true },
	prefix: { type: String, default: "--" },
	pollTime: { type: Number, default: 60000 },
	pollMessage: { type: String, default: "Poll has begun!" },
	pollSize: { type: Number, min: 1, max: 10, default: 10 },
	autoViewed: { type: Boolean, default: false },
	addMoviesRole: { type: String, default: null }
});

module.exports = mongoose.model('Settings', SettingsSchema);