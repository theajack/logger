/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:53:23
 * @Description: Coding something
 */
import {ILogData, IStoreConfig} from './type';

export class Stroe {
    useIndexedDB = !!window.indexedDB;
    canUse = !!window.indexedDB || !!window.localStorage;
    maxRecords: number;

    records: ILogData[] = [];
    constructor ({
        id,
        localStorageFallback,
        maxRecords,
    }: IStoreConfig) {
        console.log(id, localStorageFallback);
        if (maxRecords) this.maxRecords = maxRecords;

        if (this.useIndexedDB) {
            this.initIndexedDB(id);
        }
    }

    save (data: ILogData) {
        console.log(data);
    }

    private initIndexedDB (id: string = '') {
        console.log(id);
        // const request = window.indexedDB.open(`tc_logger_${id}`, version);
        // request.onsuccess = function (e) {
        //     resolve(e.target.result);
        // };
        // request.onerror = function (e) {
        //     reject(e);
        // };
        // request.onupgradeneeded = function (e) {
        //     const db = e.target?.result;
      
        //     if (!db.objectStoreNames.contains(storeName)) {
        //         const objectStore = db.createObjectStore(storeName, {
        //             keyPath: 'id',
        //             autoIncrement: true
        //         });
        //         objectStore.createIndex('index', 'filename', {
        //             unique: false
        //         });
        //     }
        // };
    }
}