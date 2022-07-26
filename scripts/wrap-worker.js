/*
 * @Author: tackchen
 * @Date: 2022-07-25 08:48:00
 * @Description: Coding something
 */
const {readFileContent, resolveRootPath, writeStringIntoFile} = require('./ebuild/utils');

const filePath = resolveRootPath('src/worker/dist/worker.min.js');

const code = readFileContent(filePath); // .replace(/\n/g, '\\\n').replace('/\\"/', '\\\"');

const str = `export default \`${code}\`;`;

writeStringIntoFile(str, filePath);
writeStringIntoFile(`declare const code: string;
export default code;`, filePath.replace('.js', '.d.ts'));


