/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:53:23
 * @Description: Coding something
 */
import {
    IBaseInfoParam,
    IStoreConfig,
} from '../type';
import {DBBaseMethods} from 'src/common/db-base';
import {WorkerStore} from './worker-store';
    
export class Store {

    StoreObject: DBBaseMethods;

    canUseIndexedDB = !!window.Worker && !!window.indexedDB;
    canUseStore = !!window.indexedDB || !!window.localStorage;
    maxRecords: number = 0;
    id: string;
    useStore: boolean;
    storage: Storage;

    constructor ({
        useStore = true,
        id = 'default',
        useStorageInstead,
        maxRecords,
        useConsole = true,
        onReport,
    }: IStoreConfig) {
        this.useStore = useStore;
        this.id = id;
        // console.log(id, useStorageInstead);
        if (maxRecords) this.maxRecords = maxRecords;
        if (useStore) {
            const options: IBaseInfoParam = {id, useConsole, maxRecords, onReport};
            if (this.canUseIndexedDB) {
                this.StoreObject = new WorkerStore(options);
            } else if (useStorageInstead) {
                // todo 使用localStorage 代替indexedDB
                // this.storage = new Storage(id);
                // this.storage.baseInfo.injectConfig();
            }
        } else {
            // todo tmp store
        }
    }
}