'use strict';

const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = function makeWebpackConfig(options) {
    /**
     * Environment type
     * BUILD is for generating minified builds
     * TEST is for generating test builds
     */
    var BUILD = !!options.BUILD;
    var TEST = !!options.TEST;
    var E2E = !!options.E2E;
    var DEV = !!options.DEV;

    /**
     * Config
     * Reference: http://webpack.github.io/docs/configuration.html
     * This is the object where all configuration gets set
     */
    var config = {};

    config.mode = 'production';
    config.devtool = 'source-map'
    if (DEV) {
      config.mode = 'development';
      config.devtool = 'inline-source-map'
    }

    /**
     * Entry
     * Reference: http://webpack.github.io/docs/configuration.html#entry
     * Should be an empty object if it's generating a test build
     * Karma will set this when it's a test build
     */
    if(TEST) {
        config.entry = {};
    } else {
        config.entry = {
            app: './client/app/app.js',
            polyfills: './client/polyfills.js',
            vendor: [
                'angular',
                'angular-aria',
                'angular-cookies',
                'angular-resource',
                'angular-sanitize',
                '@uirouter/angularjs',
                'oclazyload',
                'angular-loading-bar',
                'angular-filter-count-to/dist/angular-filter-count-to.min.js',
                'angular-moment',
                'moment',
                'moment-timezone/builds/moment-timezone-with-data-2012-2022.min',
                'parsleyjs',
                'bootstrap',
                'mapbox-gl',
                'mobx',
                'mobx-state-tree',
                'axios',
            ],
        };
    }

    config.resolve = {
      alias: {
         mobx: path.resolve(__dirname, 'node_modules/mobx')
      }
    }

    config.optimization = {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'all',
            name: 'vendor',
            test: 'vendor',
            enforce: true
          },
          polyfills: {
            chunks: 'all',
            name: 'polyfills',
            test: 'polyfills',
            enforce: true
          },
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true
          }
        }
      },
      runtimeChunk: 'single',
      minimizer: [
        new TerserPlugin(),
        new OptimizeCSSAssetsPlugin({})
      ]
    }

    /**
     * Output
     * Reference: http://webpack.github.io/docs/configuration.html#output
     * Should be an empty object if it's generating a test build
     * Karma will handle setting it up for you when it's a test build
     */
    if(TEST) {
        config.output = {};
    } else {
        config.output = {
            // Absolute output directory
            path: BUILD ? path.join(__dirname, '/dist/client/') : path.join(__dirname, '/.tmp/'),

            // Output path from the view of the page
            // Uses webpack-dev-server in development
            publicPath: BUILD || DEV || E2E ? '/' : `http://localhost:${8080}/`,
            //publicPath: BUILD ? '/' : 'http://localhost:' + env.port + '/',

            // Filename for entry points
            // Only adds hash in build mode
            filename: BUILD ? '[name].[contenthash].js' : '[name].bundle.js',

            // Filename for non-entry points
            // Only adds hash in build mode
            chunkFilename: BUILD ? '[name].[contenthash].js' : '[name].bundle.js'
        };
    }


    if(TEST) {
        config.resolve = {            modulesDirectories: [
                'node_modules'
            ],
            extensions: ['', '.js', '.ts']
        };
    }

    /**
     * Devtool
     * Reference: http://webpack.github.io/docs/configuration.html#devtool
     * Type of sourcemap to use per build type
     */
    if(TEST) {
        config.devtool = 'inline-source-map';
    } else if(BUILD || DEV) {
        config.devtool = 'cheap-module-source-map';
    } else {
        config.devtool = 'eval';
    }

    // Initialize module
    config.module = {
        noParse: /(mapbox-gl)\.js$/,
        rules: [{
            // JS LOADER
            // Reference: https://github.com/babel/babel-loader
            // Transpile .js files using babel-loader
            // Compiles ES6 and ES7 into ES5 code
            test: /\.js$/,
            loader: 'babel-loader',
            include: [
                path.resolve(__dirname, 'client/'),
                path.resolve(__dirname, 'node_modules/lodash-es/')
            ]
        }, {
            // TS LOADER
            // Reference: https://github.com/s-panferov/awesome-typescript-loader
            // Transpile .ts files using awesome-typescript-loader
            test: /\.ts$/,
            loader: 'awesome-typescript-loader',
            query: {
                tsconfig: path.resolve(__dirname, 'tsconfig.client.json')
            },
            include: [
                path.resolve(__dirname, 'client/')
            ]
        }, {
            // ASSET LOADER
            // Reference: https://github.com/webpack/file-loader
            // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
            // Rename the file using the asset hash
            // Pass along the updated reference to your code
            // You can add here any file extension you want to get copied to your output
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|otf)([\?]?.*)$/,
            loader: 'file-loader'
        }, {

            // HTML LOADER
            // Reference: https://github.com/webpack/raw-loader
            // Allow loading html through js
            test: /\.html$/,
            loader: 'raw-loader'
        }, {
            test: /\.scss$/,
            use: [
                // fallback to style-loader in development
                !BUILD ? 'style-loader' :
                MiniCssExtractPlugin.loader,
                "css-loader",
                "sass-loader"
            ],
            include: [
                path.resolve(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets/*.scss'),
                path.resolve(__dirname, 'client/app/app.scss')
            ]
        }]
    };

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: BUILD ? '[name].[hash].css' : '[name].bundle.css',
          chunkFilename: BUILD ? '[id].[hash].css' : '[id].css',
        }),
        new webpack.ProvidePlugin({
          $: 'jquery',
          'jQuery': 'jquery',
          'window.jQuery': 'jquery',
          'window.$': 'jquery',
          'moment': 'moment-timezone/builds/moment-timezone-with-data-2012-2022.min',
          'window.moment': 'moment-timezone/builds/moment-timezone-with-data-2012-2022.min',
          'window.mobx': 'mobx',
        }),
        new webpack.DefinePlugin({
          'require.specified': 'require.resolve'
        }),
        // Ignore all locale files of moment.js
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerMode: 'static' }),
        new webpack.HashedModuleIdsPlugin()
    ];

    // Render index.html
    let htmlConfig = {
        template: 'client/app.template.html',
        filename: '../client/app.html',
        alwaysWriteToDisk: true,
        chunksSortMode: 'dependency',
    }
    config.plugins.push(
      new HtmlWebpackPlugin(htmlConfig),
    );
    config.plugins.push(
      new HtmlWebpackHarddiskPlugin()
    );

    config.cache = DEV;

    if(TEST) {
        config.stats = {
            colors: true,
            reasons: true
        };
        config.debug = false;
    }

    /**
     * Dev server configuration
     * Reference: http://webpack.github.io/docs/configuration.html#devserver
     * Reference: http://webpack.github.io/docs/webpack-dev-server.html
     */
    config.devServer = {
        contentBase: './client/',
        stats: {
            modules: false,
            cached: false,
            colors: true,
            chunk: false
        }
    };


    return config;
};
