const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => ({
  mode: argv.mode || "production",

  entry: path.resolve(__dirname, "src/index.ts"),

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.es.js",
    library: {
      type: "commonjs2",
    },
    clean: true,
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],

    fallback: {
      fs: false,
    },
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
    exprContextCritical: false,
  },

  // Keep lazy imports in a single bundle so the library does not emit async
  // chunks. Consumer micro-frontends only serve the main bundle, so extra chunk
  // requests would 404 at runtime.
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  externals: {
    react: "react",
    "react-dom": "react-dom",

    "@emotion/react": "@emotion/react",
    "@emotion/styled": "@emotion/styled",
    "styled-components": "styled-components",

    "@mui/material": "@mui/material",
    "@mui/icons-material": "@mui/icons-material",
    "@mui/lab": "@mui/lab",
    "@mui/styles": "@mui/styles",

    "@madie/madie-design-system": "@madie/madie-design-system",
  },

  // supresss
  // ignoreWarnings: [
  //   /Critical dependency: the request of a dependency is an expression/,
  // ],

  devtool: "source-map",
});
