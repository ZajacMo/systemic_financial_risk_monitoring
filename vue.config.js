const { defineConfig } = require('@vue/cli-service');
const { registerAPIs } = require('./src/server/api');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      // mount our deterministic tool APIs
      registerAPIs(devServer.app);
      return middlewares;
    },
  },
});
