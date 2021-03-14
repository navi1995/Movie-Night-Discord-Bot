module.exports = {
	name: "polltime",
	description: "Updates poll time to chosen number.",
	usage: "[time chosen (in seconds)]",
	admin: true,
	async execute(message, args, main, settings) {
		if (!args.length) {
			message.channel.send(`Poll time is currently set to: ${settings.pollTime/1000} seconds`);

			return;
		} else if (args.length > 1 || isNaN(Number(args[0]))) {
			message.channel.send("Please only specify a number.");
			
			return;
		} else {
			var pollTime = Number(args[0]) * 1000;
			var limited = false;

			if (pollTime >= main.maxPollTime * 1000) {
				pollTime = main.maxPollTime*1000;
				limited = true;
			}

			return main.setting.updateOne({guildID: message.guild.id}, { "pollTime": pollTime }, function(err) {
				if (!err && !limited) {
					message.channel.send(`Poll time has now been set to: ${Number(args[0])} seconds`);
				} else if (!err && limited) {
					message.channel.send(`Cannot set time higher than 7200 seconds (2 hours). Poll time has now been set to: 7200 seconds`);
				} else {
					message.channel.send("Couldn't set Poll message, something went wrong");
				}

				return;
			});
		}
	}
};