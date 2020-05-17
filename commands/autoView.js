module.exports = {
	name: 'autoview',
	description: 'Turns on or off auto view after poll is complete (Hides movie from future polls).',
	usage: '[on or off]',
	args: true,
	async execute(message, args, main) {
		if (args.length > 1 || (args[0].toLowerCase() != "on" && args[0].toLowerCase() != "off")) {
			return message.channel.send("Please only specify on or off.");
		} else {
			var autoView = args[0].toLowerCase() == "on";

			main.setting.updateOne({guildID: message.guild.id}, {
				"autoViewed": autoView
			}, function(err) {
				if (!err) {
					var settings = main.guildSettings.get(message.guild.id);

					settings.autoViewed = autoView
					main.guildSettings.set(message.guild.id, settings);
					message.channel.send(`Auto view has now been set to: ${autoView ? "On" : "Off"}`);
				} else {
					message.channel.send("Couldn't set auto view, something went wrong");
				}
			});

		}
	}
};