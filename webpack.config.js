const { mergeWithRules } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const orgName = "madie";

const merge = mergeWithRules({
  module: {
    rules: {
      test: "match",
      use: "replace",
    },
  },
  plugins: "append",
});

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "madie-editor",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
    orgPackagesAsExternal: false,
  });

  // This must be updated for any single-spa applications or utilities,
  // or any other package to be loaded externally
  const externalsConfig = {
    externals: ["@madie/madie-util"],
  };

  const newCssRule = {
    module: {
      rules: [
        { test: /\.m?js/, type: "javascript/auto" },
        {
          test: /\.css$/i,
          include: [/node_modules/, /src/],
          use: [
            "style-loader",
            "css-loader", // uses modules: true, which I think we want. Parent does not
            "postcss-loader",
          ],
        },
        {
          test: /\.scss$/,
          resolve: {
            extensions: [".scss", ".sass"],
          },
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
              options: { sourceMap: true, importLoaders: 2 },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "sass-loader",
            },
          ],
          exclude: /node_modules/,
        },
        { test: /\.json$/, type: "json" },
      ],
    },
  };

  // node polyfills
  const polyfillConfig = {
    resolve: {
      fallback: {
        fs: false,
      },
    },
    plugins: [new NodePolyfillPlugin()],
  };

  return merge(defaultConfig, polyfillConfig, newCssRule, externalsConfig);
};
