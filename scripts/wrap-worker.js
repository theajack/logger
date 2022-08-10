/*
 * @Author: tackchen
 * @Date: 2022-07-25 08:48:00
 * @Description: Coding something
 */
const {readFileContent, resolveRootPath, writeStringIntoFile} = require('./build/utils');

const filePath = resolveRootPath('src/worker/dist/worker.min.ts');

const code = readFileContent(filePath).replace(/instance\.\\n/g, 'instance.'); // .replace(/\n/g, '\\\n').replace('/\\"/', '\\\"');

const str = `export default \`var module = {}; ${code}\`;`;

writeStringIntoFile(filePath, str);
// writeStringIntoFile(filePath.replace('.js', '.d.ts'), `declare const code: string;
// export default code;`);


