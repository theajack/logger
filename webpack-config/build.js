/*
 * @Author: tackchen
 * @Date: 2022-07-25 09:06:53
 * @Description: Coding something
 */
const path = require('path');
const configBase = require('./config.base');

module.exports = () => {
    return {
        mode: 'production',
        entry: path.resolve('./', 'src/index.ts'),
        output: {
            path: path.resolve('./', 'dist'),
            filename: 'ts-logger.min.js',
            library: 'TLogger',
            libraryTarget: 'umd',
            libraryExport: 'default',
        },
        resolve: configBase.resolve,
        module: {
            rules: configBase.rules,
        }
    };
};