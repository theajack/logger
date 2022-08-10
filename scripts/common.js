/*
 * @Author: tackchen
 * @Date: 2022-08-09 18:18:17
 * @Description: Coding something
 */

const execa = require('execa');
const {resolveRootPath} = require('./build/utils');

async function wrapWorkerCode () {
  await execa(
    'node',
    [
      resolveRootPath('scripts/wrap-worker.js'),
    ],
    {stdio: 'inherit'},
  );
}
module.exports = {
  wrapWorkerCode
};