const { defineConfig } = require("@vue/cli-service");
const { registerAPIs } = require("./src/server/api");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // 关闭 gzip 压缩，避免对小块 NDJSON 的缓冲
    compress: false,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      // mount our deterministic tool APIs
      registerAPIs(devServer.app);
      return middlewares;
    },
  },
});
