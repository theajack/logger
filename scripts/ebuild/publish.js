const {exec, resolveRootPath} = require('./utils');

const version = process.argv[2] || '1.0.0';

console.log(`Publish version = ${version}`);

// todo. publish npm dir

exec(`npm publish ${resolveRootPath('npm')}`);