/*
 * @Author: tackchen
 * @Date: 2022-07-24 19:17:32
 * @Description: Coding something
 */

import {IDownloadOptions, IJson, ILogDBData, IMessageData, TWorkerType} from '../type';
import {DBBase, IAddReturn, IDownloadInfo, TFilterOption} from '../common/db-base';
import {checkValue} from '../filter-json/filter';
import {dataToLogString} from '../common/utils';
import {FuncFilter} from '../filter-json/func-filter';
import {TLog} from '../common/t-log';

const INDEX_NAME = 'logid';

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
    download: (data) => db.download(data),
    count: () => db.count(),
    delete: (msgid) => db.delete(msgid),
    clear: () => db.clear(),
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

    add (data?: IMessageData) {
      return new Promise<IAddReturn>(async (resolve) => {
        if (!data) {
          TLog.warn('add: data is required');
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

    private _addDBData (dbData: ILogDBData) {
      return new Promise<IAddReturn>(async (resolve) => {
        // TLog.log('traceid', dbData.traceid);
        const request = this._getStore('readwrite').add(dbData);

        // {
        //     __type: 'discard',
        //     discard: ILogDBData,
        //     add: ILogDBData,
        // }
        request.onsuccess = async () => {
          const n = await this.count();
          let discard: ILogDBData | null = null;
          if (n > this.baseInfo.config.maxRecords) {
            discard = await this._removeFirst();
          }
          resolve({
            discard,
            add: dbData,
          });
        };
        request.onerror = (event) => {
          TLog.error('数据写入失败', event);
          resolve(null);
        };
      });
    }

    private _getStore (mode: IDBTransactionMode = 'readonly') {
      return this.db.transaction([this.STORE_NAME], mode) // 新建事务，readwrite, readonly(默认), versionchange
        .objectStore(this.STORE_NAME);
    }

    clear () {
      return new Promise<boolean>((resolve) => {
        const objectStore = this._getStore('readwrite');
        const request = objectStore.clear();
        request.onsuccess = function () {
          TLog.log('清除数据成功');
          resolve(true);
        };
        request.onerror = function () {
          TLog.warn('清除数据成功');
          resolve(false);
        };
      });
    }

    close () {
      this.db.close();
      this.db = undefined as any;
      delete dbMap[this.name];
      return Promise.resolve(true);
    }

    destory () {
      return new Promise<boolean>((resolve) => {
        this.close();
        const request = globalThis.indexedDB.deleteDatabase(this.baseInfo.name);
        request.onsuccess = () => {
          TLog.info('数据库已销毁');
          resolve(true);
        };
        request.onerror = (event) => {
          TLog.warn('数据库销毁失败:', event);
          resolve(false);
        };
      });
    }
    
    get (logid: string) {
      return new Promise<ILogDBData | null>((resolve) => {
        const request = this._getStore('readonly').index(INDEX_NAME).get(logid); // 传主键
        request.onerror = function () {
          TLog.error('数据查询失败', logid);
          resolve(null);
        };
        request.onsuccess = function () {
          if (request.result) {
            resolve(request.result);
          } else {
            TLog.warn('未查询到记录', logid);
            resolve(null);
          }
        };
      });
    }

    getAll () {
      return new Promise<ILogDBData[]>((resolve) => {
        const result: ILogDBData[] = [];
        this._cursorBase({
          onvalue (value) {result.push(value);},
          onend () {resolve(result);},
          onerror () {resolve([]);}
        });
      });
    }

    download ({filter, keys = []}: IDownloadOptions) {
      filter = FuncFilter.transBack(filter);
      return new Promise<IDownloadInfo>((resolve) => {
        let content = '';
        let count = 0;
        this._cursorBase({
          onvalue (value) {
            if (checkValue(value, filter)) {
              count ++;
              content += `${dataToLogString(value, keys)}\\n`;
            }
          },
          onend () {resolve({content, count});},
          onerror () {resolve({content, count});}
        });
      });
    }

    filter (filter?: TFilterOption | string) {
      filter = FuncFilter.transBack(filter);
      return new Promise<ILogDBData[]>((resolve) => {
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

    count () {
      return new Promise<number>((resolve) => {
        const objectStore = this._getStore();

        const index = objectStore.index(INDEX_NAME);
        const countRequest = index.count();
        countRequest.onsuccess = () => {
          resolve(countRequest.result);
        };
        countRequest.onerror = () => {
          resolve(-1);
        };
      });
    }

    private _getKey (logid: string) {
      return new Promise<number>(async (resolve) => {
        const objectStore = this._getStore('readonly');
        const request = objectStore.index(INDEX_NAME).getKey(logid);
        request.onsuccess = (event) => {
          resolve((event?.target as any)?.result || -1);
        };
        request.onerror = (event) => {
          TLog.warn('getKey error', event);
          resolve(-1);
        };
      });
    }

    delete (logid: string) {
      return new Promise<boolean>(async (resolve) => {
        const key = await this._getKey(logid);
            
        if (key === -1) {
          TLog.warn('删除失败, 记录不存在：', logid);
          resolve(false);
          return;
        }
        const objectStore = this._getStore('readwrite');
        const request = objectStore.delete(key);
        request.onsuccess = function () {
          resolve(true);
        };
        request.onerror = function (event) {
          resolve(false);
          TLog.warn('删除日志失败', event);
        };
      });
    }

    private _removeFirst () {
      return new Promise<ILogDBData | null>((resolve) => {
        const objectStore = this._getStore('readwrite');
        const cursorObject = objectStore.openCursor(); // ! 此处不能使用索引 因为需要删除最早的
        cursorObject.onsuccess = (event) => {
          const cursor: any = (event?.target as any).result;
          // console.warn(cursor, cursor?.value);
          if (cursor) {
            cursor.delete();
            resolve(cursor.value);
          } else {
            resolve(null);
            TLog.warn('移除最早记录失败, cursor = null', event);
          }
        };
        cursorObject.onerror = (event) => {
          TLog.warn('移除最早记录失败', event);
          resolve(null);
        };
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
        TLog.error('查询失败');
        onerror();
      };
    }

    private _initDB () {
      // TLog.log('_initDB:', this.name);
      const request = globalThis.indexedDB.open(this.name, 1);
      request.onerror = function (event) {
        TLog.error('数据库打开失败', event);
      };
      request.onsuccess = () => {
        this.db = request.result as IDBDatabase;
        this.loadCallbacks.forEach(fn => fn());
        // TLog.log('数据库打开成功: ', this.baseInfo.name);
      };
      request.onupgradeneeded = (event) => {
        // TLog.log('数据库onupgradeneeded', event);
        const db = (event.target as any)?.result as IDBDatabase;
        this._checkCreateStore(db, this.STORE_NAME);
      };
    }

    private _checkCreateStore (db: IDBDatabase, id: string) {
      if (!db.objectStoreNames.contains(id)) {
        const store = db.createObjectStore(id, {
          autoIncrement: true,
        });
        store.createIndex(INDEX_NAME, INDEX_NAME, {unique: true});
      }
    }

}
