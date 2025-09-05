const path = require("path");

const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.resolve.alias.set("@", path.resolve(__dirname, "src"));
  },
  publicPath: "./",
  outputDir: "dist",
  assetsDir: "", // 资源（如图片）直接放在 dist 根目录
  css: {
    extract: {
      filename: "css/[name].[contenthash].css",
      chunkFilename: "css/[name].[contenthash].css",
    },
  },
  configureWebpack: {
    output: {
      filename: "js/[name].[contenthash].js",
      chunkFilename: "js/[name].[contenthash].js",
    },
  },
});
