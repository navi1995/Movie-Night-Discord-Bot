module.exports = {
	name: "pollsize",
	description: "Updates poll size to chosen number (Max 10).",
	usage: "[number of movies to show in poll]",
	admin: true,
	async execute(message, args, main, settings) {
		if (!args.length) {
			return message.channel.send(`Poll size is currently set to: ${settings.pollSize}`);
		} else if (args.length > 1 || isNaN(args[0])) {
			return message.channel.send("Please only specify a number.");
		} else {
			const pollSize = Math.floor(Number(args[0]));

			if (pollSize >= 1 || pollSize <= 10) {
				return main.setting.updateOne({guildID: message.guild.id}, { pollSize }, err => {
					return message.channel.send(err ? "Couldn't set Poll size, something went wrong" : `Poll size has now been set to: ${pollSize}`);
				});
			} else {
				return message.channel.send("Poll size must be atleast 1 and a maximum of 10");
			}
		}
	}
};