module.exports = {
	name: "polltime",
	description: "Updates poll time to chosen number.",
	usage: "[time chosen (in seconds)]",
	args: true,
	admin: true,
	async execute(message, args, main, callback) {
		if (args.length > 1 || isNaN(Number(args[0]))) {
			message.channel.send("Please only specify a number.");
			
			return callback();
		} else {
			var pollTime = Number(args[0]) * 1000;

			return main.setting.updateOne({guildID: message.guild.id}, { "pollTime": pollTime }, function(err) {
				if (!err) {
					message.channel.send(`Poll time has now been set to: ${Number(args[0])} seconds`);
				} else {
					message.channel.send("Couldn't set Poll message, something went wrong");
				}

				return callback();
			});
		}
	}
};