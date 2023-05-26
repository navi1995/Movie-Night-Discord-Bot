const { Events } = require("discord.js");
const { Setting } = require("../../Models/schema");
const { hiddenReply } = require("../helpers/helperFunctions");

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		const client = interaction.client;
		const command = client.commands.get(interaction.commandName);
		let fetchedSettings;

		fetchedSettings = await Setting.findOne({ guildID: interaction.guildId });

		if (!fetchedSettings) {
			fetchedSettings = await new Setting({ guildID: interaction.guildId }).save().catch((err) => {
				console.error("Guild create", err);
			});
		}
		if (!fetchedSettings) return await interaction.reply("Couldn't fetch my settings. Try reinviting me.");

		//If no permissions
		if (interaction.guild && !interaction.channel.permissionsFor(client.application.id).has(["AddReactions", "ManageMessages", "EmbedLinks", "ReadMessageHistory", "ViewChannel", "SendMessages"])) {
			return await interaction
				.reply(
					hiddenReply(
						"Bot cannot correctly run commands in this channel. \nPlease update bots permissions for this channel to include:\n" +
						"SEND MESSAGES, ADD REACTION, MANAGE MESSAGES, EMBED LINKS, READ MESSAGE HISTORY, VIEW CHANNEL\nAdmins may need to adjust the hierarchy of permissions."
					)
				)
				.catch((error) => {
					console.error(`Could not send permission message`, error);
				});
		}

		//Send message, arguments and additional functions/variables required to the command.
		try {
			console.log(command.data.name + " " + new Date());
			await interaction.deferReply(); // Responsibility of command.
			await command.execute(interaction, fetchedSettings);
		} catch (error) {
			console.error("Problem executing command", error);
			// return await interaction.editReply({ content: "There was an error trying to execute that command!" });
		}
	},
};