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

  // We need node polyfills to understand antlr4ts
  const polyfillConfig = {
    resolve: {
      fallback: {
        fs: false,
      },
    },
    plugins: [new NodePolyfillPlugin()],
  };

  return merge(defaultConfig, polyfillConfig, externalsConfig);
};
