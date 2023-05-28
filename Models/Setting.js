const { mongoose, Schema, ObjectId } = require("../Discord Bot/node_modules/mongoose");

const Setting = new Schema({
	id: ObjectId,
	guildID: { type: String, unique: true, index: true },
	autoViewed: { type: Boolean, default: false },
	addMoviesRole: { type: String, default: null },
	pollRole: { type: String, default: null },
	deleteMoviesRole: { type: String, default: null },
	viewedMoviesRole: { type: String, default: null },
});

module.exports = mongoose.model("Settings", Setting);
