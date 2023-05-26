const { Events } = require('discord.js');
const { Setting } = require("../../Models/schema");

module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {
		await new Setting({ guildID: guild.id }).save().catch((err) => {
			if (err) {
				console.error("Guild create", err);
			}
		});
	},
};