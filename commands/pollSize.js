module.exports = {
	name: 'pollsize',
	description: 'Updates poll size to chosen number (Max 10).',
	usage: '[number of movies to show in poll]',
	args: true,
	async execute(message, args, main) {
		if (args.length > 1 || isNaN(Number(args[0]))) {
			return message.channel.send("Please only specify a number.");
		} else {
			var pollSize = Number(args[0]).toFixed(0);

			if (pollSize >= 1 || pollSize <= 10) {
				main.setting.updateOne({guildID: message.guild.id}, {
					"pollSize": pollSize
				}, function(err) {
					if (!err) {
						var settings = main.guildSettings.get(message.guild.id);
		
						settings.pollTime = pollSize
						main.guildSettings.set(message.guild.id, settings);
						message.channel.send(`Poll size has now been set to: ${pollSize}`);
					} else {
						message.channel.send("Couldn't set Poll size, something went wrong");
					}
				});
			} else {
				return message.channel.send("Poll size must be atleast 1 and a maximum of 10");
			}
		}
	}
};