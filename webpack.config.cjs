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

  const babelLoaderRule = {
    test: /\.(js|ts|jsx|tsx)$/,
    exclude: /node_modules/,
    use: "babel-loader", // Uses shared babel.config.js
  };

  const newCssRule = {
    module: {
      rules: [
        { test: /\.m?js$/, type: "javascript/auto" },
        babelLoaderRule,
        {
          test: /\.css$/i,
          include: [/node_modules/, /src/],
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.scss$/,
          resolve: {
            extensions: [".scss", ".sass"],
          },
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { sourceMap: true, importLoaders: 2 },
            },
            {
              loader: "postcss-loader",
              options: { sourceMap: true },
            },
            "sass-loader",
          ],
          exclude: /node_modules/,
        },
        { test: /\.json$/, type: "json" },
        
      ],
    },
  };

  const polyfillConfig = {
    resolve: {
      fallback: {
        fs: false,
      },
    },
    plugins: [new NodePolyfillPlugin()],
  };

  const esmOutputConfig = {
    output: {
      filename: "madie-madie-editor.js",
      module: true,
      library: {
        type: "module"
      },
      environment: {
        module: true
      }
    },
    experiments: {
      outputModule: true
    },
    externalsType: "module",
    externals: {
      react: "react",
      "react-dom": "react-dom",
      "react-dom/client": "react-dom/client",
      // these will compile common jsx and break every esm build without using them as externals.
      'react/jsx-runtime': 'react/jsx-runtime',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
      
      "@madie/madie-root": "@madie/madie-root",
      "@madie/madie-util": "@madie/madie-util"
    }
  };

  return merge(defaultConfig, polyfillConfig, newCssRule, esmOutputConfig);
};
