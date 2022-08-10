/*
 * @Author: tackchen
 * @Date: 2022-08-03 21:07:04
 * @Description: Coding something
 */

const execa = require('execa');
const {resolveRootPath, copyFile, buildPackageJson, syncVersion} = require('./utils');

async function build () {
  await execa(
    'node',
    [
      resolveRootPath('node_modules/rollup/dist/bin/rollup'),
      '-c',
      resolveRootPath('scripts/build/rollup.config.js'),
      // '--environment',
      // [
      //   `PACKAGE_NAME:${dirName}`,
      // ],
    ],
    {stdio: 'inherit'},
  );
}

async function main () {
  syncVersion(process.argv[2]);
  await build();
  buildPackageJson();
  copyFiles();
}

function copyFiles () {
  copyFile('@LICENSE', '@npm/LICENSE');
  copyFile('@README.md', '@npm/README.md');
}

main();

