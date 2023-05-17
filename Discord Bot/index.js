const { token } = require("./config.json");
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./bot.js', { 
	token,
	mode: "process",
	respawn: true
 });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`))

manager.spawn({timeout: -1});