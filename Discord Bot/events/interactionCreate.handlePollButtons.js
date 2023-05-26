const { Events, ButtonBuilder } = require('discord.js');
const { Poll } = require("../../Models/schema");

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

		let poll = await Poll.findOne({ messageID: interaction.message.id });
	
		if (!poll) return;
		if (poll.ended) {
			return await interaction.reply({ content: "Poll has already ended.", ephemeral: true });
		}
	
		await interaction.deferUpdate();
	
		if (!poll.allowMultipleVotes) {
			Object.keys(poll.votes)
				.filter((key) => key != interaction.customId && poll.votes[key].voters.includes(interaction.user.id))
				.forEach(async (idx) => {
					await Poll.updateOne({ messageID: interaction.message.id }, { $pull: { [`votes.${idx}.voters`]: interaction.user.id } });
				});
		}
	
		if (poll.votes[interaction.customId].voters.includes(interaction.user.id)) {
			await Poll.updateOne({ messageID: interaction.message.id }, { $pull: { [`votes.${interaction.customId}.voters`]: interaction.user.id } });
		} else {
			await Poll.updateOne({ messageID: interaction.message.id }, { $push: { [`votes.${interaction.customId}.voters`]: interaction.user.id } });
		}
	
		poll = await Poll.findOne({ messageID: interaction.message.id });
	
		var comps = await (
			await interaction.message.fetch(true)
		).components.map((row) => {
			row.components = row.components?.map((v) => {
				return ButtonBuilder.from(v).setLabel(`${poll.votes[v.customId].voters.length || 0}`);
			});
	
			return row;
		});
	
		await interaction.message.edit({
			components: comps,
		});
	},
};