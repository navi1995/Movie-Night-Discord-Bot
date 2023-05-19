const { token } = require("./config.json");
// const { AutoPoster } = require('topgg-autoposter')
// const { ClusterManager } = require("discord-hybrid-sharding");
const { ShardingManager } = require("discord.js");
const manager = new ShardingManager('./bot.js', {
	token,
	mode: "worker",
	respawn: true
 });
// const manager = new ClusterManager("./bot.js", {
// 	totalShards: "auto", // or 'auto
// 	shardsPerClusters: 5,
// 	mode: "worker", // you can also choose "worker"
// 	token: token
// });

// manager.on("clusterCreate", (cluster) => console.log(`Launched Cluster ${cluster.id}`));
// manager.spawn({ timeout: -1 });
manager.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`));
manager.spawn({ timeout: -1 });
