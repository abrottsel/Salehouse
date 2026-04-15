module.exports = {
  apps: [
    {
      name: 'zemplus-bot',
      script: 'zemplus-bot.js',
      cwd: __dirname,
      env: {
        TG_BOT_TOKEN: '',
        TG_CHAT_ID: '',
        SITE_URL: 'http://147.45.68.37',
      },
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
