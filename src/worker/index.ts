/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:16:35
 * @Description: Coding something
 */

import {IBaseInfoOption, IDBConfig, IWorkerMessage} from '../type';
import {DB} from './store';

globalThis.addEventListener('message', async function (
    this: Window,
    e: {data: IWorkerMessage}
) {
    const {type, data, id} = e.data;

    const db = new DB(id);
    // console.log('indexedDB', this.indexedDB);
    // this.indexedDB.open('tc_logger_test', 1);
    let result: boolean = true;
    switch (type) {
        case 'injectConfig': {
            db.injectConfig(data as IDBConfig);
        };

        case 'add': {
            result = await db.add(data);
        }; break;

        case 'closeDB': {
            db.close();
        }; break;

        case 'injectBaseInfo': {
            db.injectBaseInfo(data as IBaseInfoOption);
        }; break;
    }

    (globalThis.postMessage as any)({id, type, result});
}, false);
