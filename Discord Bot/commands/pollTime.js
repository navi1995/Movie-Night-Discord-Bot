module.exports = {
	name: "polltime",
	description: "Updates poll time to chosen number.",
	usage: "[time chosen (in seconds)]",
	admin: true,
	async execute(message, args, main, settings) {
		if (!args.length) {
			return message.channel.send(`Poll time is currently set to: ${settings.pollTime / 1000} seconds`);
		} else if (args.length > 1 || isNaN(args[0])) {
			return message.channel.send("Please only specify a number.");
		} else {
			let pollTime = Math.floor(Number(args[0]) * 1000);
			let limited = false;

			if (pollTime >= main.maxPollTime * 1000) {
				pollTime = main.maxPollTime * 1000;
				limited = true;
			}

			return main.setting.updateOne({ guildID: message.guild.id }, { pollTime }, err => {
				if (!err && !limited) {
					return message.channel.send(`Poll time has now been set to: ${pollTime / 1000} seconds`);
				} else if (!err && limited) {
					return message.channel.send(`Cannot set time higher than 7200 seconds (2 hours). Poll time has now been set to: 7200 seconds`);
				} else {
					return message.channel.send("Couldn't set Poll message, something went wrong");
				}
			});
		}
	}
};