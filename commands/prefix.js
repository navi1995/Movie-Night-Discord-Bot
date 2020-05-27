module.exports = {
	name: "prefix",
	description: "Updates prefix to chosen string.",
	usage: "[prefix chosen]",
	args: true,
	admin: true,
	async execute(message, args, main) {
		if (args.length > 1) {
			return message.channel.send("No spaces allowed in command prefix.");
		} else {
			main.setting.updateOne({guildID: message.guild.id}, { "prefix":  args[0].trim()	}, function(err) {
				if (!err) {
					var settings = main.guildSettings.get(message.guild.id);

					settings.prefix = args[0].trim();
					main.guildSettings.set(message.guild.id, settings);
					message.channel.send(`Prefix has now been set to: ${args[0].trim()}`);
				} else {
					message.channel.send("Couldn't set prefix, something went wrong");
				}
			});
		}
	}		
};