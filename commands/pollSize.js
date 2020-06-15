module.exports = {
	name: "pollsize",
	description: "Updates poll size to chosen number (Max 10).",
	usage: "[number of movies to show in poll]",
	args: true,
	admin: true,
	async execute(message, args, main, callback) {
		if (args.length > 1 || isNaN(Number(args[0]))) {
			message.channel.send("Please only specify a number.");
			
			return callback();
		} else {
			var pollSize = Number(args[0]).toFixed(0);

			if (pollSize >= 1 || pollSize <= 10) {
				return main.setting.updateOne({guildID: message.guild.id}, { "pollSize": pollSize }, function(err) {
					if (!err) {
						message.channel.send(`Poll size has now been set to: ${pollSize}`);
					} else {
						message.channel.send("Couldn't set Poll size, something went wrong");
					}

					return callback();
				});
			} else {
				message.channel.send("Poll size must be atleast 1 and a maximum of 10");

				return callback();
			}
		}
	}
};