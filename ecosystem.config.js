module.exports = {
    apps: [
      {
        name: 'IA Coworking Admin NextJs', // Your project name
        script: 'npm',
        args: 'start',
        env_production: {
          NODE_ENV:"production",
          PORT: 5100
        }
      }
    ],
  };
  