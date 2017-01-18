const path = require('path');
const webpack = require("webpack");
const BowerWebpackPlugin = require("bower-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const styleLoader = ExtractTextPlugin.extract("css?sourceMap!less?sourceMap");

const wpConfig = {
    entry: {
        app: ["./src/js/main.js", "webpack/hot/dev-server"]
    },
    output: {
        path: path.resolve(__dirname, 'build/'),
        filename: "main.js",
        sourceMapFilename: '[file].map',
        publicPath: "/"
    },
    devtool: 'cheap-module-eval-source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {test: /\.less$/, exclude: /node_modules/, loader: styleLoader},
            {test: /\.(eot|svg|ttf|woff|woff2|png)$/, exclude: /node_modules/, loader: "file-loader"},
        ]
    },
    resolve: {
        modulesDirectories: ["node_modules", "bower_components"]
    },
    plugins: [
        new BowerWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new ExtractTextPlugin('styles.css', {
            allChunks: true
        })
    ]
};

module.exports = wpConfig;