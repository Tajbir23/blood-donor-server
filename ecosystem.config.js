module.exports = {
    apps: [
      {
        name: "server",
        script: "dist/server.js",
        instances: 1,          // 500MB সার্ভারে একটাই instance – cluster off
        exec_mode: "fork",
        node_args: "--max-old-space-size=420 --gc-interval=100",
        env: {
          NODE_ENV: "development",
        },
        env_production: {
          NODE_ENV: "production",
        },
        watch: false,
        max_memory_restart: "460M", // TF.js training spike সামলাতে একটু বেশি
        kill_timeout: 5000,
        restart_delay: 3000,
      },
    ],
  };
  