/*
 * @Author: tackchen
 * @Date: 2022-07-24 20:08:19
 * @Description: Coding something
 */
const path = require('path');
const RunNodeWebpackPlugin = require('run-node-webpack-plugin');

module.exports = () => {
    return {
        watch: true,
        watchOptions: {
            ignored: /dist/
        },
        mode: 'production',
        entry: path.resolve('./', 'src/worker/index.ts'),
        output: {
            path: path.resolve('./', 'src/worker/dist'),
            filename: 'worker.min.js',
            libraryTarget: 'var',
            libraryExport: 'default',
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ]
        },
        externals: {},
        module: {
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
        },
        plugins: [

            new RunNodeWebpackPlugin({scriptToRun: 'scripts/wrap-worker.js'})
        ]
    };
};