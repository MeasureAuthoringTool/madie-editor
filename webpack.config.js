const HtmlWebpackPlugin = require("html-webpack-plugin");
const { mergeWithRules } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const orgName = "madie";

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
    externals: [
      "@madie/root-config",
      "@madie/madie-layout",
      "@madie/madie-auth",
    ],
  };

  // We need to override the css loading rule from the parent configuration
  // so that we can add postcss-loader to the chain
  const newCssRule = {
    module: {
      rules: [
        {
          test: /\.css$/i,
          include: [/node_modules/, /src/],
          use: [
            "style-loader",
            "css-loader", // uses modules: true, which I think we want. Parent does not
            "postcss-loader",
          ],
        },
      ],
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, "local-dev-env"),
          publicPath: "/importmap",
        },
        {
          directory: path.join(
            __dirname,
            "node_modules/@madie/madie-root/dist/"
          ),
          publicPath: "/",
        },
        {
          directory: path.join(
            __dirname,
            "node_modules/@madie/madie-layout/dist/"
          ),
          publicPath: "/madie-layout",
        },
        {
          directory: path.join(
            __dirname,
            "node_modules/@madie/madie-auth/dist/"
          ),
          publicPath: "/madie-auth",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(
          __dirname,
          "node_modules/@madie/madie-root/dist/index.html"
        ),
      }),
      new MiniCssExtractPlugin({
        filename: "default.css",
      }),
    ],
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

  return mergeWithRules({
    module: {
      rules: {
        test: "match",
        use: "replace",
      },
    },
    plugins: "append",
  })(defaultConfig, newCssRule, polyfillConfig, externalsConfig);
};
