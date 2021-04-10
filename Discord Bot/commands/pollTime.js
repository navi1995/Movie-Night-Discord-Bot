module.exports = {
	name: "polltime",
	description: "Updates poll time to chosen number.",
	usage: "[time chosen (in seconds)]",
	admin: true,
	async execute(message, args, main, settings) {
		if (!args.length) {
			return message.channel.send(`Poll time is currently set to: ${settings.pollTime / 1000} seconds`);
		} else if (args.length > 1 || isNaN(args[0])) {
			return message.channel.send("Please only specify a number.");
		} else {
			let pollTime = Math.floor(Number(args[0]) * 1000);
			let limited = false;

			if (pollTime >= main.maxPollTime * 1000) {
				pollTime = main.maxPollTime * 1000;
				limited = true;
			}

			return main.setting.updateOne({ guildID: message.guild.id }, { pollTime }, err => {
				if (!err && !limited) {
					return message.channel.send(`Poll time has now been set to: ${pollTime / 1000} seconds`);
				} else if (!err && limited) {
					return message.channel.send(`Cannot set time higher than ${main.maxPollTime} seconds (${secondsToHms(main.maxPollTime)}). Poll time has now been set to: ${pollTime / 1000} seconds`);
				} else {
					return message.channel.send("Couldn't set Poll message, something went wrong");
				}
			});
		}
	}
};

function secondsToHms(d) {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);

	var hDisplay = h > 0 ? h + (h == 1 ? " hour" : " hours") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return [hDisplay, mDisplay, sDisplay].filter(Boolean).join(", "); 
}