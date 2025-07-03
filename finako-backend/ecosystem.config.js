module.exports = {
  apps: [{
    name: 'finako-backend',
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/finako/backend-error.log',
    out_file: '/var/log/finako/backend-out.log',
    log_file: '/var/log/finako/backend-combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
