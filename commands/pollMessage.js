module.exports = {
	name: "pollmessage",
	description: "Updates pollmessage to chosen string.",
	usage: "[prefix chosen]",
	admin: true,
	async execute(message, args, main, callback, settings) {
		if (!args.length) {
			message.channel.send(`Poll message is currently set to: ${settings.pollMessage}`);

			return callback();
		} else {
			var pollMessage = args.join(" ").trim();

			return main.setting.updateOne({guildID: message.guild.id}, { "pollMessage": pollMessage }, function(err) {
				if (!err) {
					message.channel.send(`Poll message has now been set to: ${pollMessage}`);
				} else {
					message.channel.send("Couldn't set Poll message, something went wrong");
				}

				return callback();
			});
		}
	}
};