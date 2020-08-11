const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;
const MovieSchema = new mongoose.Schema({
	id: ObjectId,
	primaryKey: { type: String, unique: true },
	guildID: { type: String, index: true },
	movieID: String,
	imdbID: String,
	name: String,
	posterURL: String,
	overview: String,
	releaseDate: Date,
	runtime: Number,
	rating: Number,
	submittedBy: String,
	submitted: { type: Date, default: Date.now },
	viewed: { type: Boolean, default: false },
	viewedDate: { type: Date, default: null }
});

module.exports = mongoose.model('Movie', MovieSchema);