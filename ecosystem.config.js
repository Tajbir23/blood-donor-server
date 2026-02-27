module.exports = {
    apps: [
      {
        name: "server",
        script: "dist/server.js",
        instances: "max",       // সব CPU core ব্যবহার করবে (cluster mode)
        exec_mode: "cluster",   // multi-process — Redis দিয়ে state share হবে
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
        // Graceful shutdown — Redis disconnect এর সময় দেয়
        listen_timeout: 8000,
        // Zero-downtime restart
        wait_ready: false,
      },
    ],
  };
  