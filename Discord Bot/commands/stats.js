module.exports = {
	name: "stats",
	description: "Gets number of guilds and members the bot is in",
	async execute(message, args, main) {
		const promises = [
			main.client.shard.fetchClientValues('guilds.cache.size'),
			main.client.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount)', 0),
		];
		
		return Promise.all(promises)
			.then(results => {
				const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
				const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
				return message.channel.send({ embed: {
					color: 0x03a9f4,
					title: 'Bot Stats',
					description: `Server count: ${totalGuilds}\nMember count: ${totalMembers}`
				} });
			}).catch(console.error);
	}
};