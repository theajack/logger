
const {resolveRootPath, writeStringIntoFile, exec} = require('./utils');

const map = require(resolveRootPath('scripts/dependent-graph.json'));

function buildLearnAdd () {
    const addArr = [];
    for (const key in map) {
        const arr = map[key];

        arr.forEach((dep) => {
            addDep(dep, key, (str) => {
                console.log(str);
                addArr.push(str);
            });
        });
    }

    writeStringIntoFile(addArr.join('\n'), 'scripts/lerna-add.txt');
}

async function addDep (dep, key, success) {
    const cmd = `lerna add ${dep} --scope=${key}`;
    await exec(cmd);
    success(`lerna add ${dep} --scope=${key}`);
}

buildLearnAdd();

