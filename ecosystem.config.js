module.exports = {
  apps: [
    {
      name: "backend-app",
      script: "./server.js",
      watch: true,
      env: {
        NODE_ENV: "development",
        PORT: 5050,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5050,
      },
    },
  ],
};
