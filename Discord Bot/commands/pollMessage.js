module.exports = {
	name: "pollmessage",
	description: "Updates pollmessage to chosen string.",
	usage: "[poll message]",
	admin: true,
	async execute(message, args, main, settings) {
		if (!args.length) {
			return message.channel.send(`Poll message is currently set to: ${settings.pollMessage}`);
		} else {
			const pollMessage = args.join(" ").trim();

			return main.setting.updateOne({ guildID: message.guild.id }, { pollMessage }, err => {
				return message.channel.send(err ? "Couldn't set Poll message, something went wrong" : `Poll message has now been set to: ${pollMessage}`);
			});
		}
	}
};