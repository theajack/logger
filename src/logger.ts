/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:52:13
 * @Description: Coding something
 */
import {
    IJson, IBaseInfoOption, IMessageData, TLogType,
    IBaseInfoParam, IStoreConfig, ILogDBData
} from './type';
import {dateToStr, download, uuid} from './common/utils';
import {
    ILoggerOption,
} from './type';
import {DBBaseMethods, IAddReturn, TFilterOption, TSyncType} from './common/db-base';
import {WorkerStore} from './store/worker-store';
import {StorageStore} from './store/storage';

interface ISyncStore {
    async: DBBaseMethods;
    sync: StorageStore;
}

type TLoggerReturn<T, K> = (T extends 'async' ? Promise<K> : K)

export class Logger<T extends TSyncType = 'async'> {

    private _store: ISyncStore[T];
    id: string;

    constructor ({
        id = 'default',
        useConsole = true,
        storeType = 'idb',
        maxRecords = 50000,
        baseInfo,
        onReport,
        onDiscard,
    }: ILoggerOption = {}) {
        if (!id) throw new Error('Logger id is required');
        
        this._store = this._initStore({
            id,
            storeType,
            maxRecords,
            useConsole,
            onReport,
            onDiscard,
        });

        this.id = id;
        this.injectBaseInfo(baseInfo);
    }

    injectBaseInfo (baseInfo: IBaseInfoOption & IJson = {}) {
        baseInfo.uid = LoggerHelper.initUid(baseInfo?.uid);
        baseInfo.url = baseInfo.url || window.location.href;
        baseInfo.ua = baseInfo.ua || window.navigator.userAgent;
        return this._store.injectBaseInfo(baseInfo) as TLoggerReturn<T, void>;
    }

    log (...args: any[]) {
        return this._logCommon(args, 'log');
    }
    error (...args: any[]) {
        return this._logCommon(args, 'error');
    }
    warn (...args: any[]) {
        return this._logCommon(args, 'warn');
    }
    info (...args: any[]) {
        return this._logCommon(args, 'info');
    }
    private _logCommon (args: any[], type: TLogType) {
        const data = LoggerHelper.buildLogData(args, type);
        return this._store.add(data) as TLoggerReturn<T, IAddReturn>;
    }
    close () {
        return this._store.close() as TLoggerReturn<T, boolean>;
    }
    destory () {
        return this._store.destory() as TLoggerReturn<T, boolean>;
    }
    clear () {
        return this._store.clear() as TLoggerReturn<T, boolean>;
    }
    count () {
        return this._store.count() as TLoggerReturn<T, number>;
    }
    delete (logid: string) {
        return this._store.delete(logid) as TLoggerReturn<T, boolean>;
    }

    refreshTraceId () {
        return this._store.refreshTraceId() as TLoggerReturn<T, void>;
    }

    refreshDurationStart () {
        return this._store.refreshDurationStart() as TLoggerReturn<T, void>;
    }

    // 下载日志
    download ({
        name, filter
    }:{
        name?: string;
        filter?: TFilterOption
    } = {}): TLoggerReturn<T, number> {

        if (!name) name = dateToStr(new Date(), '_');
        
        const data = this._store.download(filter);

        if (data instanceof Promise) {
            return new Promise(resolve => {
                data.then(({content, count}) => {
                    download({name: `${name}.log`, content});
                    resolve(count);
                });
            }) as TLoggerReturn<T, number>;
        } else {
            download({name: `${name}.log`, content: data.content});
            return data.count as TLoggerReturn<T, number>;
        }
    }

    get (logid: string) {
        return this._store.get(logid) as TLoggerReturn<T, ILogDBData | null>;
    }

    getAll () {
        return this._store.getAll() as TLoggerReturn<T, ILogDBData[]>;
    }


    filter (filter?: TFilterOption) {
        if (!filter) {
            return this.getAll();
        }
        return this._store.filter(filter) as TLoggerReturn<T, ILogDBData[]>;
    }
    private _initStore ({
        id,
        storeType,
        maxRecords,
        useConsole,
        onReport,
        onDiscard,
    }: IStoreConfig): ISyncStore[T] {
        const canUseIndexedDB = !!window.Worker && !!window.indexedDB;
        const options: IBaseInfoParam = {id, useConsole, maxRecords, onReport, onDiscard};
        
        if (storeType === 'idb' && canUseIndexedDB) {
            return new WorkerStore(options) as any;
        } else {
            return new StorageStore({
                ...options,
                storeType
            });
        }
    }
}

const LoggerHelper = {
    buildLogData (args: any[], type: TLogType = 'log'): IMessageData {
        let msg = '__def__';
        let payload: any = args;
        if (typeof args[0] === 'string') {
            msg = args[0];
            payload = args.slice(1);
        }
        const data: IMessageData = {
            msg,
            type,
        };
        if (payload.length > 0) {
            data.payload = payload;
        }
        return data;
    },
    initUid (uid?: string): string {
        const KEY = '_tc_logger_uid';
        if (uid) {
            window.localStorage.setItem(KEY, uid);
            return uid;
        } else {
            let uid = window.localStorage.getItem(KEY);
            if (!uid) {
                uid = uuid();
                window.localStorage.setItem(KEY, uid);
            }
            return uid;
        }
    }
};