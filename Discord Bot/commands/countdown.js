module.exports = {
	name: "countdown",
	description: "Counts down from 3 to 0.",
	aliases: ["cd"],
	async execute(message) {
		let seconds = 3;
		let message1;
		
		await message.channel.send("Counting down.").then(function (msg) {
			message1 = msg;
		});

		let countdown = setInterval(async function() {
			seconds--;
			await message1.edit(seconds + 1);

			if (seconds == -1) {
				clearInterval(countdown);
			}
		}, 1000);
	}	
};