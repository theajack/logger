/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:17:32
 * @Description: Coding something
 */

import {IJson, ILogData} from '../type';

const DEFAULT_DB_NAME_PREFIX = 'tc_logger';

const dbMap: IJson<DB> = {

};

export class DB {
    db: IDBDatabase;
    index: number;
    name: string;
    private STORE_NAME = 'records';
    // private KEY_NAME = 'log_id';

    private loadCallbacks: Function[] = []

    constructor (id: string = 'default') {
        this.name = `${DEFAULT_DB_NAME_PREFIX}_${id}`;

        if (dbMap[this.name]) return dbMap[this.name];
        console.log('constructor, ', this.db);
        if (!this.db) {
            this._initDB();
        }
        dbMap[this.name] = this;
    }

    add (data?: ILogData): Promise<boolean> {
        return new Promise((resolve) => {
            console.log('saveLog: ', this.db, this.name, data);
            if (!data) {
                console.warn('add: data is required');
                return false;
            }
            if (!this.db) {
                this.loadCallbacks.push(async () => {
                    resolve(await this.add(data));
                });
            } else {
                const request = this.db.transaction([this.STORE_NAME], 'readwrite') // 新建事务，readwrite, readonly(默认), versionchange
                    .objectStore(this.STORE_NAME) // 拿到IDBObjectStore 对象
                    .add(data);
                console.log('写入数据');
                request.onsuccess = function (event) {
                    console.log('数据写入成功', event);
                    resolve(true);
                };
                request.onerror = function (event) {
                    console.log('数据写入失败', event);
                    resolve(false);
                };
            }
        });
    }

    close () {
        this.db.close();
        this.db = undefined as any;
    }

    delete () {
        this.close();
        globalThis.indexedDB.deleteDatabase(this.name);
        delete dbMap[this.name];
    }

    private _initDB () {
        const request = globalThis.indexedDB.open(this.name, 1);
        request.onerror = function (event) {
            console.error('数据库打开报错', event);
        };
        request.onsuccess = (event) => {
            this.db = request.result as IDBDatabase;
            this.loadCallbacks.forEach(fn => fn());
            console.log('数据库打开成功', this, event);
        };
        request.onupgradeneeded = (event) => {
            console.warn('onupgradeneeded', event);
            const db = (event.target as any)?.result as IDBDatabase;
            this._checkCreateStore(db, this.STORE_NAME);
        };
    }

    private _checkCreateStore (db: IDBDatabase, id: string) {
        if (!db.objectStoreNames.contains(id)) {
            db.createObjectStore(id, {
                // keyPath: this.KEY_NAME,
                autoIncrement: true
            });
        }
    }
}
