const { token } = require("./config.json");
const { ShardingManager } = require('discord.js');
const Cluster = require('discord-hybrid-sharding');
// const manager = new ShardingManager('./bot.js', { 
// 	token,
// 	mode: "worker",
// 	respawn: true
//  });
const manager = new Cluster.Manager('./bot.js', { 
	token,
	mode: "worker",
	respawn: true
 });

 manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));

manager.spawn({timeout: -1});
// manager.spawn({ 
// 	timeout: 60000,
// 	delay: 15000
// });