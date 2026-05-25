module.exports = {
  apps: [
    {
      name: 'zemplus-bot',
      script: 'zemplus-bot.js',
      cwd: __dirname,
      env: {
        TG_BOT_TOKEN: '',
        TG_CHAT_ID: '',
        MAX_BOT_TOKEN: '',
        SITE_URL: 'https://prozemplus.ru',
      },
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
    },
    {
      name: 'zemplus-max-bot',
      script: 'zemplus-bot-max.js',
      cwd: __dirname,
      env: {
        MAX_BOT_TOKEN: '',
        TG_BOT_TOKEN: '',
        TG_CHAT_ID: '',
        SITE_URL: 'https://prozemplus.ru',
      },
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
    },
    {
      name: 'prozemplus-bot',
      script: 'prozemplus-bot.js',
      cwd: __dirname,
      env: {
        PROZEM_BOT_TOKEN: '',
        TG_CHAT_ID: '',
        PROZEM_CHANNEL_ID: '-1003773945288',
        SITE_URL: 'https://prozemplus.ru',
      },
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
