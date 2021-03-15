module.exports = {
	name: "prefix",
	description: "Updates prefix to chosen string.",
	usage: "[prefix chosen]",
	admin: true,
	async execute(message, args, main, settings) {
		if (!args.length) {
			return message.channel.send(`Prefix is currently set to: ${settings.prefix}`);
		} else if (args.length > 1) {
			return message.channel.send("No spaces allowed in command prefix.");
		} else if (args[0].length > 1900) {
			return message.channel.send("That prefix is too long.");
		} else {
			return main.setting.updateOne({ guildID: message.guild.id }, { prefix: args[0].trim() }, err => {
				if (!err) {
					return message.channel.send(`Prefix has now been set to: ${args[0].trim()}`, { allowedMentions: { parse: [] } });
				} else {
					return message.channel.send("Couldn't set prefix, something went wrong");
				}
			});
		}
	}		
};