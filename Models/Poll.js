const  { mongoose, Schema } = require("../Discord Bot/node_modules/mongoose");

const Poll = new Schema({
	guildID: { type: String, index: true },
	messageID: { type: String, index: true },
	channelID: String,
	votes: Object, // { key = index, value = { movieName, emoji, [voters] }}
	endDateTime: Date,
	ended: {
		type: Boolean,
		default: false,
	},
	allowMultipleVotes: Boolean,
	testEnvironment: { type: Boolean, default: false }
});

module.exports = mongoose.model("Polls", Poll);