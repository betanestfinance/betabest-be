module.exports = {
  apps: [
    {
      name: "backend-app",
      script: "./server.js",   // ✅ must exist here
      watch: true,
      env: {
        NODE_ENV: "development",
        PORT: 5050,
        MONGO_URI:"mongodb://127.0.0.1:27017/betanestdb",
        GMAIL_USER:"betanest.finance@gmail.com",
        GMAIL_PASS:"nvcc ckpc tgxn cgdl",
        JWT_SECRET:"thisismysecretkey",
        CLIENT_URL:"http://localhost:5050"
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5050,
        MONGO_URI:"mongodb+srv://betanestfinance_db_user:r6BPpQZpVIoUqWtd@betanestfinance.jzyhw6m.mongodb.net/betanestdb",
        GMAIL_USER:"betanest.finance@gmail.com",
        GMAIL_PASS:"nvcc ckpc tgxn cgdl",
        JWT_SECRET:"thisismysecretkey",
        CLIENT_URL:"betanestfin.com"
      },
    },
  ],
};
