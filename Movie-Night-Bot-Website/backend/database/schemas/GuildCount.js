const mongoose = require('mongoose');
const GuildCountSchema = new mongoose.Schema({
	count: { type: Number, default: 0 }
}, { max: 1, capped: 1024 });

module.exports = mongoose.model('GuildCount', GuildCountSchema);