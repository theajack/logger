/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:17:32
 * @Description: Coding something
 */

import {IJson, ILogData, ILogDBData} from '../type';
import {DBBase} from '../common/db-base';


const dbMap: IJson<WorkerDB> = {

};

export class WorkerDB extends DBBase {
    db: IDBDatabase;
    index: number;


    private STORE_NAME = 'records';
    // private KEY_NAME = 'log_id';

    private loadCallbacks: Function[] = []

    constructor (id: string = 'default') {
        super({id, useConsole: true, maxRecords: 0});
        if (dbMap[this.name]) return dbMap[this.name];
        if (!this.db) {
            this._initDB();
        }
        dbMap[this.name] = this;
        console.log('init', this.baseInfo.data.traceid);
    }

    add (data?: ILogData): Promise<null | ILogDBData> {
        return new Promise(async (resolve) => {
            if (!data) {
                console.warn('add: data is required');
                return null;
            }
            const dbData: ILogDBData = this.baseInfo.appendBaseInfo(data);
            if (!this.db) {
                this.loadCallbacks.push(async () => {
                    resolve(await this._addDBData(dbData));
                });
            } else {
                resolve(await this._addDBData(dbData));
            }
        });
    }

    private _addDBData (dbData: ILogDBData): Promise<ILogDBData | null> {
        return new Promise((resolve) => {
            console.log('in add', this.baseInfo.data.traceid);
            console.log('traceid', dbData.traceid);
            const request = this.db.transaction([this.STORE_NAME], 'readwrite') // 新建事务，readwrite, readonly(默认), versionchange
                .objectStore(this.STORE_NAME) // 拿到IDBObjectStore 对象
                .add(dbData);
            // console.log('写入数据');
            request.onsuccess = function () {
            // console.log('数据写入成功', event);
                resolve(dbData);
            };
            request.onerror = function (event) {
                console.log('数据写入失败', event);
                resolve(null);
            };
        });
    }

    close () {
        this.db.close();
        this.db = undefined as any;
    }

    destory () {
        this.close();
        globalThis.indexedDB.deleteDatabase(this.baseInfo.name);
        delete dbMap[this.name];
    }

    private _initDB () {
        const request = globalThis.indexedDB.open(this.name, 1);
        request.onerror = function (event) {
            console.error('数据库打开报错', event);
        };
        request.onsuccess = () => {
            this.db = request.result as IDBDatabase;
            this.loadCallbacks.forEach(fn => fn());
            // console.log('数据库打开成功', this, event);
        };
        request.onupgradeneeded = (event) => {
            // console.warn('onupgradeneeded', event);
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
