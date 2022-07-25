/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:16:35
 * @Description: Coding something
 */

import {ILogData} from '../type';
import {store} from './store';

declare const globalThis: Window;

console.log(globalThis);

store.init();

globalThis.addEventListener('message', function (
    this: Window,
    e: {data: {data: ILogData, id: string}}
) {
    // console.log('indexedDB', this.indexedDB);
    // this.indexedDB.open('tc_logger_test', 1);
    console.log(globalThis, globalThis.location, e);

    store.saveLog(e.data);

    (globalThis.postMessage as any)('You said: ' + e.data); // 不加any build时会报错

}, false);
