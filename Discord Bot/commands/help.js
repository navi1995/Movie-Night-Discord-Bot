const { prefix } = require('../config.json');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: "help",
	description: "List all of my commands or info about a specific command.",
	aliases: ["commands"],
	usage: "[command name]",
	execute(message, args) {
		const data = new MessageEmbed().setColor(0x03a9f4).setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }));
		const { commands } = message.client;

		if (!args.length) {
			data.setTitle("Here's a list of all my commands:");
			data.setDescription(commands.map(command => '`' + command.name + '`').join(", ") + `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

			return message.channel.send(data);
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply("That's not a valid command!");
		}

		data.setDescription(`**Name:** ${command.name}`);

		if (command.aliases) data.setDescription(data.description + `\n**Aliases:** ${command.aliases.map(a => '`' + a + '`').join(", ")}`);
		if (command.description) data.setDescription(data.description + `\n**Description:** ${command.description}`);
		if (command.usage) data.setDescription(data.description + `\n**Usage:** ${prefix}${command.name} ${command.usage}`);

		return message.channel.send(data);
	},
};