module.exports = {
	name: "autoview",
	description: "Turns on or off auto view after poll is complete (Hides movie from future polls).",
	usage: "[on or off]",
	admin: true,
	async execute(message, args, main, settings) {
		if (args.length - 1 || !['on', 'off'].includes(args[0].toLowerCase())) {
			return message.channel.send(`Please only specify on or off. Currently setting is: ${settings.autoViewed ? 'on' : 'off'}`);
		} else {
			const autoViewed = args[0].toLowerCase() === "on";

			return main.setting.updateOne({ guildID: message.guild.id }, { autoViewed }, err => {
				if (!err) {
					return message.channel.send(`Auto view has now been set to: ${autoViewed ? "on" : "off"}`);
				} else {
					return message.channel.send("Couldn't set auto view, something went wrong");
				}
			});

		}
	}
};