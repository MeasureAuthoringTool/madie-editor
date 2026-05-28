const path = require("path");

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
        // for Ace dynamic require
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

  externals: {
    react: "react",
    "react-dom": "react-dom",
    "react-ace": "react-ace",
    "ace-builds": "ace-builds",

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
