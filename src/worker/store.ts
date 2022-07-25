/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:17:32
 * @Description: Coding something
 */

import {ILogData} from '../type';

const DB_NAME = 'tc_logger';

let db: IDBDatabase;

const window = this as any as Window;

function init (id: string) {
    if (db) return;
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onerror = function (event) {
        console.error('数据库打开报错', event);
    };
    request.onsuccess = function (event) {
        db = request.result;
        console.log('数据库打开成功', event);
    };
    request.onupgradeneeded = function (event) {
        const db = (event.target as any)?.result as IDBDatabase;
        if (!db.objectStoreNames.contains(id)) {
            db.createObjectStore(id, {
                autoIncrement: true
            });
        }
    };
}

function saveLog ({id, data}: {id: string, data: ILogData}) {
    const request = db.transaction([id], 'readwrite') // 新建事务，readwrite, readonly(默认), versionchange
        .objectStore(id) // 拿到IDBObjectStore 对象
        .add(data);
    request.onsuccess = function (event) {
        console.log('数据写入成功', event);
    };
    request.onerror = function (event) {
        console.log('数据写入失败', event);
    };
}

function close () {
    if (db) db.close();
}

export const store = {
    init,
    saveLog,
    close,
    clear () {
        close();
        window.indexedDB.deleteDatabase(DB_NAME);
    }
};
