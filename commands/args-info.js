module.exports = {
	name: 'args-info',
	description: 'Info about arguments',
	usage: '<user> <role>',
	args: true,
	execute(message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};