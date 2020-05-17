module.exports = {
	name: 'polltime',
	description: 'Updates poll time to chosen number.',
	usage: '[time chosen (in seconds)]',
	args: true,
	async execute(message, args, main) {
		if (args.length > 1 || isNaN(Number(args[0]))) {
			return message.channel.send("Please only specify a number.");
		} else {
			var pollTime = Number(args[0]) * 1000

			main.setting.updateOne({guildID: message.guild.id}, {
				"pollTime": pollTime
			}, function(err) {
				if (!err) {
					var settings = main.guildSettings.get(message.guild.id);
	
					settings.pollTime = pollTime
					main.guildSettings.set(message.guild.id, settings);
					message.channel.send(`Poll time has now been set to: ${Number(args[0])} seconds`);
				} else {
					message.channel.send("Couldn't set Poll message, something went wrong");
				}
			});
		}
	}
};