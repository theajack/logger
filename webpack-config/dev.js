/*
 * @Author: tackchen
 * @Date: 2021-01-12 18:50:34
 * @Description: Coding something
 */
const path = require('path');
const configBase = require('./config.base');

module.exports = {
    mode: 'development',
    entry: path.resolve('./', 'public/main.ts'),
    output: {
        path: path.resolve('./', 'public'),
        filename: 'bundle.js'
    },
    resolve: configBase.resolve,
    devtool: 'eval-source-map',
    devServer: {
        port: 8083,
        contentBase: path.resolve('./', 'public'),
        historyApiFallback: true,
        inline: true,
        host: 'localhost',
        disableHostCheck: true,
        proxy: {
        },
    },
    module: {
        rules: configBase.rules
    }
};