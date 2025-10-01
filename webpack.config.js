const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config();

module.exports = (env, argv) => ({
  mode: argv.mode === "production" ? "production" : "development",
  devtool: argv.mode === "production" ? false : "inline-source-map",
  entry: {
    code: "./src/code.ts",
    ui: "./src/ui.ts",
  },
  optimization: {
    minimize: argv.mode === "production",
    minimizer: argv.mode === "production" ? undefined : [],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        type: "asset/source", // Load as raw text without processing
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.GITHUB_TOKEN": JSON.stringify(
        process.env.GITHUB_TOKEN || ""
      ),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/ui.html",
          to: "ui.html",
        },
        {
          from: "tenets-reference.html",
          to: "tenets-reference.html",
        },
        {
          from: "manifest.json",
          to: "manifest.json",
        },
      ],
    }),
  ],
});
