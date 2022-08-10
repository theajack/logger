/*
 * @Author: tackchen
 * @Date: 2022-08-03 20:41:31
 * @Description: Coding something
 */
const fs = require('fs');
const path = require('path');

function resolveRootPath (str) {
  return path.resolve(__dirname, `../../${str}`);
}

function upcaseFirstLetter (str) {
  if (typeof str !== 'string' || !str) return '';
  return str[0].toUpperCase() + str.substr(1);
}

function writeJsonIntoFile (filePath, pkg) {
  fs.writeFileSync(transfromFilePath(filePath), JSON.stringify(pkg, null, 4), 'utf8');
}

function writeStringIntoFile (filePath, str) {
  fs.writeFileSync(transfromFilePath(filePath), str, 'utf8');
}

function copyFile (src, dest) {
  fs.copyFileSync(transfromFilePath(src), transfromFilePath(dest));
}

function transfromFilePath (filePath) {
  if (filePath[0] === '@') {
    return resolveRootPath(filePath.substr(1));
  }
  return filePath;
}

function mkdirDir (filePath) {
  filePath = transfromFilePath(filePath);
  if (!fs.existsSync(filePath)) {
    console.log('mkdirSync', filePath);
    fs.mkdirSync(filePath);
  }
}

function clearDirectory (dirPath) {
  dirPath = transfromFilePath(dirPath);
  if (!fs.existsSync(dirPath)) return;
  clearDirectoryBase(dirPath);
}

function clearDirectoryBase (dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = `${dirPath}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      clearDirectoryBase(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });
};

function buildPackageJson (extract = {}) {
  const pkg = require(resolveRootPath('package.json'));

  const attrs = [
    'name', 'version', 'description', 'main', 'unpkg', 'jsdelivr',
    'typings', 'repository', 'keywords', 'author', 'license',
    'bugs', 'homepage', 'dependencies', 'publishConfig'
  ];

  const npmPkg = {};

  attrs.forEach(key => {
    npmPkg[key] = pkg[key] || '';
  });

  for (const key in extract) {
    npmPkg[key] = extract[key];
  }

  mkdirDir('@npm');
  writeJsonIntoFile('@npm/package.json', npmPkg);
}

function syncVersion (version = '0.0.1') {
  
  const pkg = require(resolveRootPath('package.json'));

  if (version) {
    pkg.version = version;
    writeJsonIntoFile('@package.json', pkg);
  } else {
    version = pkg.version;
  }

  writeStringIntoFile('@src/version.ts', `export default '${version}';\n`);
}

function readFileContent (filePath) {
  return fs.readFileSync(transfromFilePath(filePath), 'utf8');
}

module.exports = {
  copyFile,
  resolveRootPath,
  transfromFilePath,
  upcaseFirstLetter,
  writeJsonIntoFile,
  writeStringIntoFile,
  buildPackageJson,
  clearDirectory,
  mkdirDir,
  readFileContent,
  syncVersion,
};
