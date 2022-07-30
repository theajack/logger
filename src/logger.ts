/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:52:13
 * @Description: Coding something
 */
import {IJson, IBaseInfoOption, IMessageData, TLogType} from './type';
import {uuid} from './common/utils';
import {
    ILoggerOption,
} from './type';
import {Store} from './store/index';

export class Logger {

    store: Store;

    useStore: boolean;

    constructor ({
        id = 'default',
        useStore = true,
        useConsole = true,
        useStorageInstead = true,
        maxRecords = 0,
        baseInfo,
        onReport,
    }: ILoggerOption) {
        
        this.useStore = useStore;
        if (useStore) {
            this.store = new Store({
                id,
                useStore,
                useStorageInstead,
                maxRecords,
                useConsole,
                onReport,
            });
        }

        if (!id) throw new Error('Logger id is required');
        
        this.injectBaseInfo(baseInfo);
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
        this.store.StoreObject.injectBaseInfo(baseInfo);
    }

    log (...args: any[]) {
        this._logCommon(args, 'log');
    }
    error (...args: any[]) {
        this._logCommon(args, 'error');
    }
    warn (...args: any[]) {
        this._logCommon(args, 'warn');
    }
    info (...args: any[]) {
        this._logCommon(args, 'info');
    }

    private _logCommon (args: any[], type: TLogType) {
        const {msg, payload} = this._shapeArgs(args);
        const data = this._buildLogData(msg, payload, type);
        this.store.StoreObject.add(data);
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
        this.store.StoreObject.refreshTraceId();
    }

    // 下载日志
    download () {
        
    }

    filter () {

    }

    private _buildLogData (msg: string, payload?: any, type: TLogType = 'log'): IMessageData {
        return {
            msg,
            payload,
            type,
        };
    }
}