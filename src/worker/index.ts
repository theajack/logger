/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:16:35
 * @Description: Coding something
 */

import {IWorkerBackMessage, IWorkerMessage} from '../type';
import {WorkerDB} from './store';

function main () {
  globalThis.addEventListener('message', async function (
    this: Window,
    e: {data: IWorkerMessage}
  ) {
    const {msgid, type, data, id} = e.data;
    
    const db = new WorkerDB(id);
    let result = db.msgMap[type](data);
    if (result instanceof Promise) {
      result = await result;
    }
    // TLog.log(globalThis, globalThis.localStorage);
    (globalThis.postMessage as any)({msgid, id, type, result} as IWorkerBackMessage);
  }, false);
}

main();

export default '1';