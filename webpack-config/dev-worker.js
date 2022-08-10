/*
 * @Author: tackchen
 * @Date: 2022-07-24 20:08:19
 * @Description: Coding something
 */
const configBase = require('./config.base');

module.exports = {
  watch: true,
  watchOptions: {
    ignored: /dist/
  },
  ...configBase.workerBase
};