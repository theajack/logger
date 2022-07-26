const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

function resolveRootPath (str) {
    return path.resolve(__dirname, `../../${str}`);
}

function resolvePacakgePath (str) {
    return path.resolve(__dirname, `../../packages/${str}`);
}

function extrackSinglePackageInfo (dir) {
    const {name, version, dependencies} = require(resolvePacakgePath(`${dir}/package.json`));
    return {
        name,
        version,
        dependencies: dependencies ? Object.keys(dependencies) : [],
    };
}

function extractPackagesInfo () {
    const dirs = fs.readdirSync(resolveRootPath('packages'));

    return dirs.map(dir => extrackSinglePackageInfo(dir));
}

function upcaseFirstLetter (str) {
    if (typeof str !== 'string' || !str) return '';
    return str[0].toUpperCase() + str.substr(1);
}

function initMonorepoPackagesInfo (isDev) {
    const dirs = fs.readdirSync(resolveRootPath('packages'));

    dirs.forEach((dir) => {
        initMonorepoSinglePackageInfo(dir, isDev);
    });
}

function initMonorepoSinglePackageInfo (dir, isDev = false) {
    const packagePath = resolvePacakgePath(`${dir}/package.json`);
    const pkg = require(packagePath);
    const prefix = 'monorepo'; // todo 修改前缀
    const packageName = `${prefix}${dir === 'main' ? '' : `-${dir}`}`;

    if (isDev) {
        pkg.main = 'src/index.ts';
        pkg.typings = 'src/index.ts';
    } else {
        pkg.main = `dist/${packageName}.min.js`;
        pkg.typings = `dist/${packageName}.d.ts`;
    }
    pkg.publishConfig = {
        registry: 'https://registry.npmjs.org/',
    };
    writeJsonIntoFile(pkg, packagePath);
    fs.copyFileSync(resolveRootPath('README.md'), resolvePacakgePath(`${dir}/README.md`));

    const tsconfig = require(resolveRootPath('tsconfig.json'));
    tsconfig.include = ['src/**/*'];
    writeJsonIntoFile(tsconfig, resolvePacakgePath(`${dir}/tsconfig.json`));
}

function writeJsonIntoFile (json, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf8');
}

function writeStringIntoFile (str, filePath, append = false) {
    append ?
        fs.appendFileSync(filePath, str, 'utf8') :
        fs.writeFileSync(filePath, str, 'utf8');
}

function readFileContent (filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

async function exec (cmd) {
    return new Promise(resolve => {
        childProcess.exec(cmd, function (error, stdout, stderr) {
            if (error) {
                resolve({success: false, stdout, stderr});
            } else {
                resolve({
                    success: true,
                    stdout,
                    stderr
                });
            }
        });
    });
}

module.exports = {
    exec,
    extrackSinglePackageInfo,
    resolveRootPath,
    resolvePacakgePath,
    extractPackagesInfo,
    upcaseFirstLetter,
    initMonorepoPackagesInfo,
    initMonorepoSinglePackageInfo,
    writeJsonIntoFile,
    writeStringIntoFile,
    readFileContent,
};
