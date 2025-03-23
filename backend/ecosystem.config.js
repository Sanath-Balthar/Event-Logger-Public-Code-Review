module.exports = {
    apps: [
      // 🔹 Development Environment
      {
        name: "backend-dev",
        script: "npm",
        args: "run dev",
        env: {
          NODE_ENV: "development",
        },
        watch: true, // Auto-restart on file changes (useful for dev)
        autorestart: true,
      },
  
      // 🔹 Staging Environment
      {
        name: "backend-stage",
        script: "npm",
        args: "run stage",
        env: {
          NODE_ENV: "stage",
        },
        watch: false, // No auto-restart for staging
        autorestart: true,
      },
  
      // 🔹 Production Environment
      {
        name: "backend-prod",
        script: "npm",
        args: "run prod",
        env: {
          NODE_ENV: "production",
        },
        watch: false, // No auto-restart for production
        autorestart: true,
      },
    ],
  };
  