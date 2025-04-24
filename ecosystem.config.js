module.exports = {
    apps: [
      {
        name: "server", // আপনার অ্যাপের নাম
        script: "dist/server.js", // compiled js ফাইল
        instances: "max", // যত CPU core, ততগুলো instance চালাবে
        exec_mode: "cluster", // multi-core mode
        env: {
          NODE_ENV: "development",
        },
        env_production: {
          NODE_ENV: "production",
        },
        watch: false, // production-এ watch রাখা ঠিক না
        max_memory_restart: "300M", // মেমোরি usage বেশি হলে restart করবে
      },
    ],
  };
  