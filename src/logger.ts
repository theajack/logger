/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:52:13
 * @Description: Coding something
 */
import {
    IJson, IBaseInfoOption, IMessageData, TLogType,
    IBaseInfoParam, IStoreConfig, TLogStoreType
} from './type';
import {dateToStr, download, uuid} from './common/utils';
import {
    ILoggerOption,
} from './type';
import {DBBaseMethods, TFilterOption} from './common/db-base';
import {WorkerStore} from './store/worker-store';
import {StorageStore} from './store/storage';

type IITest = {
    [prop in TLogStoreType]: DBBaseMethods;
}
export interface ITest extends IITest {
    idb: DBBaseMethods;
    storage: StorageStore;
}

export class Logger<T extends DBBaseMethods = DBBaseMethods> {

    store: T;
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
        
        this.store = LoggerHelper.initStore({
            id,
            storeType,
            maxRecords,
            useConsole,
            onReport,
            onDiscard,
        }) as T;

        this.id = id;
        this.injectBaseInfo(baseInfo);
    }

    injectBaseInfo (baseInfo: IBaseInfoOption & IJson = {}) {
        baseInfo.uid = LoggerHelper.initUid(baseInfo?.uid);
        baseInfo.url = baseInfo.url || window.location.href;
        baseInfo.ua = baseInfo.ua || window.navigator.userAgent;
        this.store.injectBaseInfo(baseInfo);
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
    _logCommon (args: any[], type: TLogType) {
        const data = LoggerHelper.buildLogData(args, type);
        return this.store.add(data);
    }
    close () {
        return this.store.close();
    }
    destory () {
        return this.store.destory();
    }
    clear () {
        return this.store.clear();
    }
    count () {
        return this.store.count();
    }
    delete (logid: string) {
        return this.store.delete(logid);
    }

    refreshTraceId () {
        this.store.refreshTraceId();
    }

    refreshDurationStart () {
        this.store.refreshDurationStart();
    }

    // 下载日志
    async download ({
        name, filter
    }:{
        name?: string;
        filter?: TFilterOption
    } = {}) {

        if (!name) name = dateToStr(new Date(), '_');
        
        const data = await this.store.download(filter);

        download({
            name: `${name}.log`,
            content: data
        });
        return data.length;
    }

    get (logid: string) {
        return this.store.get(logid);
    }

    getAll () {
        return this.store.getAll();
    }


    filter (filter?: TFilterOption) {
        if (!filter) {
            return this.getAll();
        }
        return this.store.filter(filter);
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
    },
    initStore ({
        id,
        storeType,
        maxRecords,
        useConsole,
        onReport,
        onDiscard,
    }: IStoreConfig): DBBaseMethods {
        const canUseIndexedDB = !!window.Worker && !!window.indexedDB;
        const options: IBaseInfoParam = {id, useConsole, maxRecords, onReport, onDiscard};
        
        if (storeType === 'idb' && canUseIndexedDB) {
            return new WorkerStore(options);
        } else {
            return new StorageStore({
                ...options,
                storeType
            });
        }
    }
};