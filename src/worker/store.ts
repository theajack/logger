/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:17:32
 * @Description: Coding something
 */

import {IJson, ILogData, ILogDBData, TWorkerType} from '../type';
import {DBBase, TFilterOption} from '../common/db-base';
import {checkValue} from '../filter-json/filter';
import {dataToLogString} from '../common/utils';
import {FuncFilter} from '../filter-json/func-filter';

const dbMap: IJson<WorkerDB> = {};

function createMessageMap (db: WorkerDB):
    Record<TWorkerType, (data: any) => (Promise<any> | any)> {
    return {
        add: (data) => db.add(data),
        injectConfig: (data) => db.baseInfo.injectConfig(data),
        closeDB: () => db.close(),
        destory: () => db.destory(),
        refreshTraceId: () => db.refreshTraceId(),
        injectBaseInfo: (data) => db.baseInfo.injectBaseInfo(data),
        get: (msgid) => db.get(msgid),
        getAll: () => db.getAll(),
        refreshDurationStart: () => db.refreshDurationStart(),
        filter: (filter: any) => db.filter(filter),
        download: (filter: any) => db.download(filter),
    };
}

export class WorkerDB extends DBBase {
    db: IDBDatabase;
    index: number;
    msgMap: Record<TWorkerType, (data: any) => (Promise<any> | any)>;

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
        this.msgMap = createMessageMap(this);
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
            // console.log('traceid', dbData.traceid);
            const request = this._getStore('readwrite').add(dbData);
            request.onsuccess = function () {
                resolve(dbData);
            };
            request.onerror = function (event) {
                console.log('数据写入失败', event);
                resolve(null);
            };
        });
    }

    private _getStore (mode: IDBTransactionMode = 'readonly') {
        return this.db.transaction([this.STORE_NAME], mode) // 新建事务，readwrite, readonly(默认), versionchange
            .objectStore(this.STORE_NAME);
    }

    close () {
        this.db.close();
        this.db = undefined as any;
        delete dbMap[this.name];
    }

    destory () {
        this.close();
        // console.log('destory');
        globalThis.indexedDB.deleteDatabase(this.baseInfo.name);
    }
    
    get (logid: string): Promise<ILogDBData | null> {
        return new Promise((resolve) => {
            const request = this._getStore('readonly').get(logid); // 传主键
            request.onerror = function () {
                console.log('查询失败');
                resolve(null);
            };
            request.onsuccess = function () {
                if (request.result) {
                    resolve(request.result);
                } else {
                    console.log('未查询到记录');
                    resolve(null);
                }
            };
        });
    }

    getAll (): Promise<ILogDBData[]> {
        return new Promise((resolve) => {
            const result: ILogDBData[] = [];
            this._cursorBase({
                onvalue (value) {result.push(value);},
                onend () {resolve(result);},
                onerror () {resolve([]);}
            });
        });
    }

    download (filter?: TFilterOption | string): Promise<string> {
        filter = FuncFilter.transBack(filter);
        return new Promise((resolve) => {
            let result = '';
            this._cursorBase({
                onvalue (value) {
                    if (checkValue(value, filter)) {
                        result += `${dataToLogString(value)}\\n`;
                    }
                },
                onend () {resolve(result);},
                onerror () {resolve('');}
            });
        });
    }

    filter (filter?: TFilterOption | string): Promise<ILogDBData[]> {
        filter = FuncFilter.transBack(filter);
        return new Promise((resolve) => {
            const result: ILogDBData[] = [];
            this._cursorBase({
                onvalue (value) {
                    if (checkValue(value, filter)) {
                        result.push(value);
                    }
                },
                onend () {resolve(result);},
                onerror () {resolve([]);}
            });
        });
    }

    private _cursorBase ({
        onend, onvalue, onerror
    }: {
        onvalue: (d: ILogDBData) => void,
        onend: ()=>void,
        onerror: ()=>void,
    }) {
        const objectStore = this._getStore();
        const cursorObject = objectStore.openCursor();
        cursorObject.onsuccess = function (event) {
            // 也可以在索引上打开 objectStore.index("id").openCursor()
            const cursor: any = (event?.target as any).result;
            if (cursor) {
                onvalue(cursor.value);
                cursor.continue();
            } else {
                onend();
            }
        };
        cursorObject.onerror = () => {
            console.error('查询失败');
            onerror();
        };
    }

    private _initDB () {
        // console.log('_initDB:', this.name);
        const request = globalThis.indexedDB.open(this.name, 1);
        request.onerror = function (event) {
            console.error('数据库打开报错', event);
        };
        request.onsuccess = () => {
            this.db = request.result as IDBDatabase;
            this.loadCallbacks.forEach(fn => fn());
            console.log('数据库打开成功: ', this.baseInfo.name);
        };
        request.onupgradeneeded = (event) => {
            // console.log('数据库onupgradeneeded', event);
            const db = (event.target as any)?.result as IDBDatabase;
            this._checkCreateStore(db, this.STORE_NAME);
        };
    }

    private _checkCreateStore (db: IDBDatabase, id: string) {
        if (!db.objectStoreNames.contains(id)) {
            db.createObjectStore(id, {
                keyPath: 'logid',
            });
        }
    }

}
