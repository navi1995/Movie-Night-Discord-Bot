module.exports = {
	name: "prefix",
	description: "Updates prefix to chosen string.",
	usage: "[prefix chosen]",
	admin: true,
	async execute(message, args, main, callback, settings) {
		if (!args.length) {
			message.channel.send(`Prefix is currently set to: ${settings.prefix}`);

			return callback();
		} else if (args.length > 1) {
			message.channel.send("No spaces allowed in command prefix.");
			
			return callback();
		} else {
			return main.setting.updateOne({guildID: message.guild.id}, { "prefix":  args[0].trim()	}, function(err) {
				if (!err) {
					message.channel.send(`Prefix has now been set to: ${args[0].trim()}`);
				} else {
					message.channel.send("Couldn't set prefix, something went wrong");
				}

				return callback();
			});
		}
	}		
};