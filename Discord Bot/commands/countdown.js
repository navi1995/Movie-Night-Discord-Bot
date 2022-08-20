const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("countdown")
		.setDescription("Counts down from set number to 0. Default is 3 seconds.")
		.addIntegerOption((option) => option.setName("seconds").setDescription("Countdown will start from this number.").addChoices({ name: "10", value: 10 }, { name: "5", value: 5 }, { name: "3", value: 3 })),
	async execute(interaction) {
		let seconds = interaction.options.getInteger("seconds") || 3;
		let message1;

		await interaction.editReply("Counting down.").then(function (msg) {
			message1 = msg;
		});

		let countdown = setInterval(async function () {
			seconds--;
			await message1.edit(seconds + 1 + "");

			if (seconds <= -1) {
				clearInterval(countdown);
			}
		}, 1000);
	},
};
