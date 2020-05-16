module.exports = {
	name: 'pollmessage',
	description: 'Updates pollmessage to chosen string.',
	usage: '[prefix chosen]',
	args: true,
	async execute(message, args, main) {
		var pollMessage = args.join(" ").trim();

		main.setting.update({guildID: message.guild.id}, {
			"pollMessage": pollMessage
		}, function(err) {
			if (!err) {
				var settings = main.guildSettings.get(message.guild.id);

				settings.pollMessage = pollMessage
				main.guildSettings.set(message.guild.id, settings);
				message.channel.send(`Poll message has now been set to: ${pollMessage}`);
			} else {
				message.channel.send("Couldn't set Poll message, something went wrong");
			}
		});
	}
};