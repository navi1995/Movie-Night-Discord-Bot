module.exports = {
	name: "pollrole",
	description: "Sets a role that is allowed to run polls. Can also clear this role by using pollrole remove",
	usage: "[@roleName]",
	args: true,
	admin: true,
	async execute(message, args, main, callback) {
		if (args.length > 1) {
			message.channel.send("Please only specify one mentioned role.");

			return callback();
		} else if (!message.mentions.roles.first() && args[0] != "clear") {
			message.channel.send("Please mention the role you'd like to set in the format pollrole [@roleName], or to clear settings use pollrole clear");

			return callback();
		} else {
			const pollRole = args[0] == "clear" ? null : message.mentions.roles.first().id;

			//Update the settings with the role user provided, or clear it and set to NULL.
			return main.setting.updateOne({ guildID: message.guild.id }, { "pollRole": pollRole }, function(err) {
				if (!err) {
					message.channel.send(pollRole ? `Users with administrator or the role ${args[0]} will now be able to run polls.` : "Setting for role allowed to run polls has been cleared. Only admins may run polls now.");
				} else {
					message.channel.send("Couldn't set role for adding permissions, something went wrong");
				}

				return callback();
			});

		}
	}
};