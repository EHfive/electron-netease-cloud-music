'use strict';

const path = require('path');
const webpack = require('webpack');
const packageJson = require('../package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

const projectRoot = path.resolve('.');

let cfg = {
    mode: process.env.NODE_ENV || 'development',
    performance: { hints: false },
    context: projectRoot,
    target: 'electron-renderer',
    entry: {
        renderer: [
            path.join(projectRoot, 'src/renderer/main.js')
        ]
    },
    output: {
        filename: '[name].js',
        path: path.join(projectRoot, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {}
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    query: {
                        name: 'imgs/[name].[ext]'
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    query: {
                        name: 'fonts/[name].[ext]'
                    }
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css'),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(projectRoot, 'src/renderer/index.ejs')
        }),
    ],
    resolve: {
        alias: {
            'assets': path.join(projectRoot, 'assets/'),
            '@': path.join(projectRoot, 'src/renderer/'),
            'util': path.join(projectRoot, 'src/renderer/util/'),
            'page': path.join(projectRoot, 'src/renderer/page/'),
            'compo': path.join(projectRoot, 'src/renderer/components/')
        }
    }
};

if (process.env.NODE_ENV === 'production') {
    // release config
    /**
     * disable source map for now.
     * see: https://github.com/mozilla/source-map/issues/304
     */
    // cfg.devtool = 'source-map';
    cfg.module.rules.map(e => {
        if (e.loader === 'vue-loader') {
            e.options.extractCSS = true;
        }
    });
    cfg.plugins.push(
        new BabelMinifyPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                PRODUCTION: 'true',
                NODE_ENV: '"production"'
            }
        })
    );
} else {
    // dev config
    cfg.devtool = 'eval-source-map';
    cfg.output.libraryTarget = 'commonjs2';
    cfg.externals = Object.keys(packageJson.dependencies);
    cfg.resolve.modules = [
        path.join(projectRoot, 'node_modules')
    ];
}

module.exports = cfg;
