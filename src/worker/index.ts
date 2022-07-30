/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:16:35
 * @Description: Coding something
 */

import {IBaseInfoOption, IWorkerBackMessage, IWorkerMessage} from '../type';
import {WorkerDB} from './store';

globalThis.addEventListener('message', async function (
    this: Window,
    e: {data: IWorkerMessage}
) {
    const {type, data, id} = e.data;

    const db = new WorkerDB(id);
    console.log('on worker msg', {type, data, id} );
    // this.indexedDB.open('tc_logger_test', 1);
    let result: any = true;
    switch (type) {
        case 'injectConfig': {
            db.baseInfo.injectConfig(data);
        }; break;

        case 'add': {
            console.warn('exec add');
            result = await db.add(data);
        }; break;

        case 'closeDB': {
            db.close();
        }; break;

        case 'refreshTraceId': {
            db.refreshTraceId();
        }; break;

        case 'injectBaseInfo': {
            db.baseInfo.injectBaseInfo(data as IBaseInfoOption);
        }; break;
    }

    (globalThis.postMessage as any)({id, type, result} as IWorkerBackMessage);
}, false);
