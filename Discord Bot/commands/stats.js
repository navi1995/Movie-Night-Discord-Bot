const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Gets number of guilds and members the bot is in"),
	async execute(interaction, main) {
		const promises = [
			main.client.cluster.fetchClientValues('guilds.cache.size'),
			main.client.cluster.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
		];
		
		return Promise.all(promises)
			.then(async results => {
				const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
				const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);

				return await interaction.editReply({embeds: [{
					color: 0x03a9f4,
					title: 'Bot Stats',
					fields: [
						{
							name: "Server Count",
							value: totalGuilds + ""
						},
						{
							name: "Member Count",
							value: totalMembers + ""
						}
					]
				}]
			});			
		}).catch(console.error);
	}
};