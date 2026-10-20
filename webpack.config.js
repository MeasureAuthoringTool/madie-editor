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
      {
        // Inline fonts (e.g. Monaco's codicon.ttf used for the find/replace,
        // folding collapse/expand chevrons, close icons, etc.) as base64 data
        // URIs. This library is consumed as a micro-frontend, so a runtime
        // publicPath cannot be relied on to locate a separately-emitted font
        // file. Inlining guarantees the codicon glyphs always render.
        test: /\.(ttf|woff2?|eot)$/,
        type: "asset/inline",
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
