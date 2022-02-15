const HtmlWebpackPlugin = require("html-webpack-plugin");
const { mergeWithRules } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const orgName = "madie";

// const fileConfig = {
// 	dirStyles: path.join(__dirname, '/src/styles/sass'),
// 	dirStatics: path.join(__dirname, '/app/static-assets'),
// 	dirBuild: path.resolve(__dirname, 'public'),
// 	dirSrc: path.join(__dirname, 'src'),
//   }

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
    //   "@madie/madie-design-system"
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
		{
			test: /\.scss$/,
			resolve: {
			  extensions: ['.scss', '.sass'],
			},
			use: [
			  {
				loader: 'style-loader',
			  },
			  {
				loader: 'css-loader',
				options: { sourceMap: true, importLoaders: 2 },
			  },
			  {
				loader: 'postcss-loader',
				options: {
				  sourceMap: true,
				},
			  },
			  {
				loader: 'sass-loader',
			  },
			],
			exclude: /node_modules/,
		  }
		// {
		// 	test: /\.scss$/,
		// 	include: [/node_modules/, /src/],
		// 	use: [
		// 	  'style-loader',
		// 	  'css-loader',
		// 	  {
		// 		loader: 'sass-loader',
		// 		// options: {
		// 		//   data: '@import "path/to/global.scss";',
		// 		//   includePaths:[__dirname, 'src']
		// 		// },
		// 	  },
		// 	],
		//   },
        // {
        //     test: /\.scss$/,
        //     use: [
        //         {
        //         loader: MiniCssExtractPlugin.loader,
        //         },
		// 		{ loader: 'style-loader' },
        //         'css-loader',
        //         {
        //         loader: 'sass-loader',
        //         // options: {
        //         //     sassOptions: {
        //         //     // includePaths: ['styles'],
		// 		// 	includePaths: ['@madie/madie-design-system']
        //         //     },
        //         // },
        //         },
        //         'sass-loader',
        //     ],
        //     exclude: /node_modules/,
        // },
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
        {
          directory: path.join(
            __dirname,
            "node_modules/@madie/madie-design-system/"
          ),
          publicPath: "/madie-design-system",
        }
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
        filename: 'default.css',
      }),
	//   new CopyWebpackPlugin({
	// 	patterns: [
	// 		// "**/*",
	// 		{
	// 		from: './node_modules/@madie/madie-design-system/fonts/',
	// 		toType: 'dir',
	// 		to: 'fonts'
	// 		  },
	// 		//   {
    //         //     context: 'node_modules/@madie/madie-design-system/fonts',
    //         //     from: '**/*',
    //         //     to: '/fonts'
    //         // },
	// 	],
	//   })
    ],
  };
// 	patterns: [
// 		{
// 		from: path.join(__dirname, '/node_modules/@madie/madie-design-system/fonts/'),
// 		to: path.resolve(__dirname, 'public/fonts')
// 	  	},
// 	],
//   })
  
  // node polyfills
  const polyfillConfig = {
    resolve: {
      fallback: {
        fs: false,
      },
    },
    plugins: [new NodePolyfillPlugin()],
  };
  console.log('webpack', path.join(__dirname, '/node_modules/@madie/madie-design-system/fonts/'))
  console.log('resolve',path.resolve(__dirname, 'public/fonts'));
  const copyConfig = {
    resolve: {
      fallback: {
        fs: false,
      },
    },
    plugins: [new CopyWebpackPlugin({
		patterns: [
			{
				from: path.join('/node_modules/@madie/madie-design-system/fonts/'),
				to: path.resolve('public/fonts'),
			}
			// {
			// 	// from: path.join(__dirname, '/node_modules/@madie/madie-design-system/fonts/'),
			// 	from: '/Users/matt.mcphillips/madie/madie-editor/node_modules/@madie/madie-design-system/fonts/',
			// 	to: 'public/fonts'
			// 	// to: path.resolve(__dirname, 'public/fonts'),
			//   },
			//   {
			// 	from: path.join(__dirname, '/node_modules/@madie/madie-design-system/images/'),
			// 	to: path.resolve(__dirname, 'public/images'),
			//   },
		  ],
	  })],
  };

  return mergeWithRules({
    module: {
      rules: {
        test: "match",
        use: "replace",
      },
    },
    plugins: "append",
//   })(defaultConfig, newCssRule, polyfillConfig, externalsConfig);
  })(defaultConfig, newCssRule, polyfillConfig, externalsConfig, copyConfig);
};
