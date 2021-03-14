module.exports = {
	name: "pollrole",
	description: "Sets a role that is allowed to run polls. Can also clear this role by using pollrole clear",
	usage: "[roleName]",
	args: true,
	admin: true,
	async execute(message, args, main) {
		let pollRole = args.join(' ');
		pollRole = (pollRole.match(/<@&([0-9]{17,21})>/) || [])[1] || (message.guild.roles.cache.find(r => pollRole !== "clear" && r.name === pollRole) || {}).id || pollRole;

		if (!message.guild.roles.resolve(pollRole) && pollRole !== "clear") {
			await message.channel.send("Please provide a valid role you'd like to set in the format `pollrole [roleName]`, or to clear settings use `pollrole clear`");

			return;
		} else {
			pollRole = pollRole === "clear" ? null : pollRole;

			//Update the settings with the role user provided, or clear it and set to NULL.
			return main.setting.updateOne({ guildID: message.guild.id }, { pollRole }, err => {
				if (!err) {
					await message.channel.send(pollRole ? `Users with administrator or the role <@&${pollRole}> will now be able to run polls.` : "Setting for role allowed to run polls has been cleared. Only admins may run polls now.");
				} else {
					await message.channel.send("Couldn't set role for adding permissions, something went wrong");
				}

				return;
			});

		}
	}
};