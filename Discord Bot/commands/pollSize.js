module.exports = {
	name: "pollsize",
	description: "Updates poll size to chosen number (Max 10).",
	usage: "[number of movies to show in poll]",
	admin: true,
	async execute(message, args, main, callback, settings) {
		if (!args.length) {
			await message.channel.send(`Poll size is currently set to: ${settings.pollSize}`);

			return callback();
		} else if (args.length > 1 || isNaN(args[0])) {
			await message.channel.send("Please only specify a number.");
			
			return callback();
		} else {
			var pollSize = Math.floor(Number(args[0]));

			if (pollSize >= 1 || pollSize <= 10) {
				return main.setting.updateOne({guildID: message.guild.id}, { pollSize }, err => {
					if (!err) {
						await message.channel.send(`Poll size has now been set to: ${pollSize}`);
					} else {
						await message.channel.send("Couldn't set Poll size, something went wrong");
					}

					return callback();
				});
			} else {
				await message.channel.send("Poll size must be atleast 1 and a maximum of 10");

				return callback();
			}
		}
	}
};