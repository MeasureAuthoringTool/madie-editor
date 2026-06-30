const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: {
      type: "commonjs2",
    },
    clean: false,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    fallback: {
      fs: false,
    },
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
    "@madie/madie-util": "@madie/madie-util",
    "@emotion/react": "@emotion/react",
    "@emotion/styled": "@emotion/styled",
    "styled-components": "styled-components",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      { test: /\.m?js/, type: "javascript/auto" },
      {
        test: /\.css$/i,
        include: [/node_modules/, /src/],
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { sourceMap: true, importLoaders: 2 } },
          { loader: "postcss-loader", options: { sourceMap: true } },
          "sass-loader",
        ],
      },
      { test: /\.json$/, type: "json" },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg|png|jpg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [new NodePolyfillPlugin()],
};
