const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Path = require('path');
const webpack = require('webpack');
const FileStream = require('fs');

var env = process.env.ENV || 'local';
var buildNumber = process.env.BUILD_NUMBER || '1';
//var SiteConfig = require('./shared/config/SiteConfig.js')(env, buildNumber);

// var cssConfig = SiteConfig.toSCSSEnv();
const isDevEnv = /^(local|dev|develop)$/gi.test(env);
const sourceMapOptions = isDevEnv ? 'eval-cheap-module-source-map' : 'source-map';
const mode = isDevEnv ? 'development' : 'production';

var config = {
    entry: {
        data: ['./src/Data/index.js'],
        // vendor: ['react', 'react-dom'],
    },
    output: {
        libraryTarget: 'umd',
        library: 'AdskDataVizData',
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: Path.join(__dirname, 'dist'),
    },
    optimization: {
        chunkIds: 'named',
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    minChunks: 2,
                    maxInitialRequests: 5, // The default limit is too small to showcase the effect
                    minSize: 0 // This is example is too small to create commons chunks
                },
                vendor: {
                    test: /node_modules/,
                    chunks: 'initial',
                    name: 'data-vendor',
                    priority: 10,
                    enforce: true
                }
            }
        }
    },
    resolve: {
        alias: {
            PIXI: Path.resolve(__dirname, 'node_modules/pixi.js/'),
        },
    },
    mode: mode,
    devtool: sourceMapOptions,
    externals: {
        three: 'THREE'
    },
    module: {
        rules: [
            {
                test: /.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/react', ['@babel/env', { 'targets': 'defaults' }]],
                            plugins: ['@babel/plugin-transform-spread']
                        },
                    },
                ],
                exclude: Path.resolve(__dirname, 'node_modules')
            },
            {
                test: /forge-dataviz-iot-react-component.*.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/react', ['@babel/env', { 'targets': 'defaults' }]],
                            plugins: ['@babel/plugin-transform-spread']
                        }
                    },
                ],
                exclude: Path.resolve(__dirname, 'node_modules', 'forge-dataviz-iot-react-components', 'node_modules'),
            },
            {
                test: /\.(css|sass|scss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader',
                        // options: {
                        //     additionalData: cssConfig
                        // }
                    }
                ]
            },
            {
                test: /\.svg$/i,
                use: {
                    loader: 'svg-url-loader',
                    options: {
                        // make loader to behave like url-loader, for all svg files
                        encoding: 'base64',
                    },
                },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new webpack.BannerPlugin(
            FileStream.readFileSync(Path.join(__dirname, 'LICENSE'), 'utf8')
        )
        // require('./tools/WebpackDefines.js'),
    ],
};

module.exports = config;