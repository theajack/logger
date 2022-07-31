/*
 * @Author: tackchen
 * @Date: 2022-07-31 09:35:11
 * @Description: Coding something
 */

const path = require('path');
const RunNodeWebpackPlugin = require('run-node-webpack-plugin');

const base = {
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    rules: [{
        test: /(.ts)$/,
        use: {
            loader: 'ts-loader'
        }
    }, {
        test: /(.js)$/,
        use: [{
            loader: 'babel-loader',
        }]
    }, {
        test: /(.js)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: /node_modules/,
        options: {
            configFile: './.eslintrc.js'
        }
    }]
};

module.exports = {
    ...base,
    workerBase: {
        mode: 'production',
        entry: path.resolve('./', 'src/worker/index.ts'),
        output: {
            path: path.resolve('./', 'src/worker/dist'),
            filename: 'worker.min.js',
            libraryTarget: 'var',
            libraryExport: 'default',
        },
        resolve: base.resolve,
        externals: {},
        module: {
            rules: base.rules,
        },
        plugins: [
            new RunNodeWebpackPlugin({scriptToRun: 'scripts/wrap-worker.js'})
        ]
    }
};