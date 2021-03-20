module.exports = {
  apps : [{
    name: "backend",
    script: "app.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}