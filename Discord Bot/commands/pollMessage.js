module.exports = {
	name: "pollmessage",
	description: "Updates pollmessage to chosen string.",
	usage: "[poll message]",
	admin: true,
	async execute(message, args, main, callback, settings) {
		if (!args.length) {
			await message.channel.send(`Poll message is currently set to: ${settings.pollMessage}`);

			return callback();
		} else {
			const pollMessage = args.join(" ").trim();

			return main.setting.updateOne({ guildID: message.guild.id }, { pollMessage }, err => {
				if (!err) {
					await message.channel.send(`Poll message has now been set to: ${pollMessage}`);
				} else {
					await message.channel.send("Couldn't set Poll message, something went wrong");
				}

				return callback();
			});
		}
	}
};