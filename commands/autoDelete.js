module.exports = {
	name: 'autodelete',
	description: 'Turns on or off auto deleting after poll is complete.',
	usage: '[on or off]',
	args: true,
	async execute(message, args, main) {
		if (args.length > 1 || (args[0].toLowerCase() != "on" && args[0].toLowerCase() != "off")) {
			return message.channel.send("Please only specify on or off.");
		} else {
			var autoDelete = args[0].toLowerCase() == "on";

			main.setting.update({guildID: message.guild.id}, {
				"autoDelete": autoDelete
			}, function(err) {
				if (!err) {
					var settings = main.guildSettings.get(message.guild.id);

					settings.autoDelete = autoDelete
					main.guildSettings.set(message.guild.id, settings);
					message.channel.send(`Auto delete has now been set to: ${autoDelete ? "On" : "Off"}`);
				} else {
					message.channel.send("Couldn't set Poll message, something went wrong");
				}
			});

		}
	}
};