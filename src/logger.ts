/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:52:13
 * @Description: Coding something
 */
import {Stroe} from './store';
import {IJson} from './type';
import {dateToStr, toLogString, uuid} from './utils';
import {
    IBaseInfo, ILoggerOptions, ILogDataConfig,
    ILogData,
} from './type';


export class Logger {
    store: Stroe;

    baseInfo: IBaseInfo = {
        uid: '',
        traceid: uuid(),
        network: '',
        url: window.location.href,
    }

    useConsole: boolean;

    constructor ({
        id = 'default',
        localStorageFallback,
        baseInfo,
        useConsole = true,
        useStore = true,
        maxRecords,
    }: ILoggerOptions) {
        if (!id) throw new Error('Logger id is required');
        this.useConsole = useConsole;
        if (useStore) {
            this.store = new Stroe({
                id, localStorageFallback, maxRecords
            });
        }
        
        if (baseInfo) this.injectBaseInfo(baseInfo);
        else this.initUid();
    }

    private initUid () {
        const KEY = 'tc_logger_uid';
        if (!this.baseInfo.uid) {
            let uid = window.localStorage.getItem(KEY);
            if (!uid) {
                uid = uuid();
                window.localStorage.setItem(KEY, uid);
            }
            this.baseInfo.uid = uid;
        } else {
            window.localStorage.setItem(KEY, this.baseInfo.uid);
        }
    }

    injectBaseInfo (baseInfo: ILogDataConfig & IJson) {
        Object.assign(this.baseInfo, baseInfo);
        this.initUid();
    }

    log (msg: string, payload?: any) {
        const data = this.buildLogData(msg, payload);
        const logString = this.dataToLogString(data);

        if (this.useConsole) {
            console.log(logString, data);
        }
    }

    error (msg: string, payload?: any) {
        const data = this.buildLogData(msg, payload, 'error');
        const logString = this.dataToLogString(data);

        if (this.useConsole) {
            console.error(logString, data);
        }
    }

    // 下载日志
    download () {
        
    }

    onReport () {
        
    }

    filter () {

    }

    refreshTraceId () {
        this.baseInfo.traceid = uuid();
    }

    private buildLogData (msg: string, payload?: any, type : 'log' | 'error' = 'log'): ILogData {
        const date = new Date();
        const timestamp = date.getTime();
        const time = dateToStr(date);
        return {
            ...this.baseInfo,
            msg,
            payload,
            type,
            timestamp,
            time,
        };
    }

    private dataToLogString (data: ILogData) {
        const payload = typeof data.payload !== 'undefined' ? ` payload=${toLogString(data.payload)};` : '';
        const network = data.network ? ` network=${data.network};` : '';
        return `[${data.time}]:${data.type === 'error' ? '[error]' : ''} msg=${data.msg}; uid=${data.uid}; traceid=${data.traceid}${network}${payload}`;
    }
}