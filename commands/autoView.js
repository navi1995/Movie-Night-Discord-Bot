module.exports = {
	name: "autoview",
	description: "Turns on or off auto view after poll is complete (Hides movie from future polls).",
	usage: "[on or off]",
	args: true,
	admin: true,
	async execute(message, args, main, callback) {
		if (args.length > 1 || (args[0].toLowerCase() != "on" && args[0].toLowerCase() != "off")) {
			message.channel.send("Please only specify on or off.");

			return callback();
		} else {
			var autoView = args[0].toLowerCase() == "on";

			return main.setting.updateOne({ guildID: message.guild.id }, { "autoViewed": autoView }, function(err) {
				if (!err) {
					message.channel.send(`Auto view has now been set to: ${autoView ? "On" : "Off"}`);
				} else {
					message.channel.send("Couldn't set auto view, something went wrong");
				}

				return callback();
			});

		}
	}
};