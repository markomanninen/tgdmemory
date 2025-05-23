// TGD Memory Monitoring Configuration
// This file contains monitoring and alerting configurations for production

// PM2 Ecosystem Configuration
module.exports = {
  apps: [{
    name: 'tgdmemory-server',
    script: './server/server.js',
    cwd: '/opt/tgdmemory/current',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Monitoring and restart policies
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'public/explanations-cache'],
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Health monitoring
    health_check_url: 'http://localhost:3000/api/ping',
    health_check_grace_period: 3000,
    
    // Advanced options
    kill_timeout: 5000,
    listen_timeout: 8000,
    cron_restart: '0 2 * * *' // Restart daily at 2 AM
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/tgdmemory.git',
      path: '/opt/tgdmemory',
      'post-deploy': 'npm install && npm run build:prod && cd server && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install nodejs npm mongodb-tools nginx -y'
    }
  }
};
