const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log("Ready!");
		client.user.setPresence({
			activities: [{ name: `Polls wont crash anymore!`, type: ActivityType.Watching }],
		});
	},
};