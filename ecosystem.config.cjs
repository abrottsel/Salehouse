/**
 * PM2 process config for the ZemPlus Next.js app.
 *
 * Usage on the server:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup    # then run the printed sudo command
 *
 * Reload (zero-downtime) after deploy:
 *   pm2 reload zemplus
 */
module.exports = {
  apps: [
    {
      name: "zemplus",
      cwd: "/var/www/zemplus",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      instances: 1,            // bump to "max" if the VPS has 2+ CPU cores
      exec_mode: "fork",       // switch to "cluster" if instances > 1
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
        // NEXT_TELEMETRY_DISABLED: "1",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};
