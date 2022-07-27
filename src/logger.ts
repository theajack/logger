/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:52:13
 * @Description: Coding something
 */
import {Stroe} from './store';
import {IJson, IBaseInfoOption, IMessageData} from './type';
import {uuid} from './utils';
import {
    ILoggerOptions,
} from './type';


export class Logger extends Stroe {
    store: Stroe;


    useConsole: boolean;

    constructor ({
        id = 'default',
        localStorageFallback,
        baseInfo,
        useConsole = true,
        useStore = true,
        maxRecords,
    }: ILoggerOptions) {
        super({
            useStore,
            id,
            localStorageFallback,
            maxRecords,
        });
        if (!id) throw new Error('Logger id is required');
        this.useConsole = useConsole;
        
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
        super.injectBaseInfo(baseInfo);
    }

    log (msg: string, payload?: any) {
        const data = this._buildLogData(msg, payload);
        super._add(data);
    }

    error (msg: string, payload?: any) {
        const data = this._buildLogData(msg, payload, 'error');
        super._add(data);
    }

    // 下载日志
    download () {
        
    }

    onReport () {
        
    }

    filter () {

    }

    private _buildLogData (msg: string, payload?: any, type : 'log' | 'error' = 'log'): IMessageData {
        return {
            msg,
            payload,
            type,
        };
    }
}