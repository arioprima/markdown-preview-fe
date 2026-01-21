module.exports = {
  apps: [
    {
      name: "markdown-preview-fe",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/markdown-preview/markdown-preview-fe",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
