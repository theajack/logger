/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:52:13
 * @Description: Coding something
 */
import {
    IJson, IBaseInfoOption, IMessageData, TLogType,
    ILogDBData, IBaseInfoParam, IStoreConfig
} from './type';
import {dateToStr, download, uuid} from './common/utils';
import {
    ILoggerOption,
} from './type';
import {DBBaseMethods, TFilterOption} from './common/db-base';
import {WorkerStore} from './store/worker-store';

export class Logger {

    store: DBBaseMethods;
    id: string;

    constructor ({
        id = 'default',
        useConsole = true,
        storeType = 'idb',
        maxRecords = 0,
        baseInfo,
        onReport,
    }: ILoggerOption) {
        if (!id) throw new Error('Logger id is required');
        
        this._initStore({
            id,
            storeType,
            maxRecords,
            useConsole,
            onReport,
        });

        this.id = id;
        this.injectBaseInfo(baseInfo);
    }

    private _initStore ({
        id,
        storeType,
        maxRecords,
        useConsole,
        onReport,
    }: IStoreConfig) {
        const canUseIndexedDB = !!window.Worker && !!window.indexedDB;
        const canStorage = !!window.localStorage;
        const options: IBaseInfoParam = {id, useConsole, maxRecords, onReport};
        
        if (storeType === 'idb' && canUseIndexedDB) {
            this.store = new WorkerStore(options);
        } else if (storeType === 'storage' && canStorage) {
            // todo 使用localStorage 代替indexedDB
            // this.storage = new Storage(id);
            // this.storage.baseInfo.injectConfig();
        } else if (storeType === 'temp') {

        } else {
            
        }
    }

    private _initUid (uid?: string): string {
        const KEY = 'tc_logger_uid';
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

    injectBaseInfo (baseInfo: IBaseInfoOption & IJson = {}) {
        baseInfo.uid = this._initUid(baseInfo?.uid);
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

    private _logCommon (args: any[], type: TLogType): Promise<ILogDBData> {
        const {msg, payload} = this._shapeArgs(args);
        const data = this._buildLogData(msg, payload, type);
        return this.store.add(data);

    }

    private _shapeArgs (args: any[]) {
        if (typeof args[0] === 'string') {
            const msg = args[0];
            let payload = args.slice(1);
            if (payload.length === 1) {
                payload = payload[0];
            }
            return {msg, payload};
        }
        return {msg: '__def__', payload: args};
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

    private _buildLogData (msg: string, payload?: any, type: TLogType = 'log'): IMessageData {
        return {
            msg,
            payload,
            type,
        };
    }
}