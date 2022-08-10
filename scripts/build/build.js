/*
 * @Author: tackchen
 * @Date: 2022-08-03 21:07:04
 * @Description: Coding something
 */

const execa = require('execa');
const {wrapWorkerCode} = require('../common');
const {resolveRootPath, copyFile, buildPackageJson, syncVersion} = require('./utils');

async function build (mode) {
  await execa(
    'node',
    [
      resolveRootPath('node_modules/rollup/dist/bin/rollup'),
      '-c',
      resolveRootPath('scripts/build/rollup.config.js'),
      '--environment',
      [
        `BUILD_MODE:${mode}`,
      ],
    ],
    {stdio: 'inherit'},
  );
}

async function main () {
  syncVersion(process.argv[2]);
  await build('worker');
  await wrapWorkerCode();
  await build('main');
  buildPackageJson();
  copyFiles();
}

function copyFiles () {
  copyFile('@LICENSE', '@npm/LICENSE');
  copyFile('@README.md', '@npm/README.md');
}

main();

