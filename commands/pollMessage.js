module.exports = {
	name: "pollmessage",
	description: "Updates pollmessage to chosen string.",
	usage: "[prefix chosen]",
	args: true,
	admin: true,
	async execute(message, args, main, callback) {
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
};