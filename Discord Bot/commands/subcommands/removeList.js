const emojis = require("../../emojis.json");
const { Movie } = require("../../../Models/schema");

async function removeList(interaction, viewedMovies) {
	if (!interaction.member.permissions.has("Administrator")) return await interaction.editReply("Sorry, only Administrators can delete all movies.");

	return interaction.editReply("Are you sure you want to remove all unviewed movies?").then(async () => {
		const botMessage = await interaction.fetchReply();
		const filter = (reaction, user) => [emojis.yes, emojis.no].includes(reaction.emoji.name) && user.id == interaction.member.id;

		try {
			await botMessage.react(emojis.yes);
			await botMessage.react(emojis.no);
		} catch (e) {
			console.log("Message deleted");
		}

		//Wait for user to confirm if movie presented to them is what they wish to be added to the list or not.
		return botMessage
			.awaitReactions({ filter: filter, max: 1, time: 15000, errors: ["time"] })
			.then(async (collected) => {
				const reaction = collected.first();

				if (reaction.emoji.name == emojis.yes) {
					await Movie.deleteMany({ guildID: interaction.guild.id, viewed: viewedMovies });

					return await interaction.followUp("All movies have been deleted.");
				} else {
					return await interaction.followUp("No movies have been deleted.");
				}
			})
			.catch(async () => {
				return await interaction.followUp("Couldn't get your response.");
			});
	});
}

module.exports = removeList;