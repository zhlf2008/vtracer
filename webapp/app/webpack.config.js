const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: true,
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../../docs/assets"),
          to: "assets",
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(__dirname, "_headers"),
          to: "_headers",
          toType: "file",
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  devServer: {
    port: 8080,
    hot: true,
    static: { directory: __dirname },
  },
};
