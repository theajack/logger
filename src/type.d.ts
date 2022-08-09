/*
 * @Author: tackchen
 * @Date: 2022-07-24 16:35:16
 * @Description: Coding something
 */
export interface IJson<T=any> {
    [prop: string]: T;
}

export type TLogType = 'error' | 'log' | 'warn' | 'info';

// 日志存储的数据
export interface ILogDBData extends ILogData {
    uid: string;
    clientid: string;
    traceid: string;
    network: string;
    url: string;
    ua: string;
    msg: string;
    payload?: any;
    type: TLogType;
    duration: number;

    time: string;
    timestamp: number;
    logid: string;
}

export type ILogData = Pick<
    ILogDBData,
    'uid' | 'traceid' | 'network' | 'url' | 'ua' |
    'msg' | 'payload' | 'type'
>

export type ILoggerConfig = Pick<
    ILogDBData,
    'uid' | 'traceid' | 'network' | 'clientid'
>

export type ILoggerConfigOption = Partial<ILoggerConfig>

export interface IBaseInfo extends ILoggerConfig, Pick<
    ILogDBData, 'url' | 'ua'
> {}

export type IBaseInfoOption = Partial<IBaseInfo>

export type IMessageData = Pick<
    ILogDBData,
    'msg' | 'payload' | 'type'
>

export type ILogString = string;

export type TLogStoreType = 'idb' | 'storage' | 'temp' | 'none';

export interface IStoreConfig {
    id: string; // 作为dbName 使用，默认为location.hostname
    useConsole: boolean;
    storeType: TLogStoreType; // 存储类型
    maxRecords: number; // 最大日志数量 默认不限制
    onReport?: (data: ILogDBData) => void;
    onDiscard?: (data: ILogDBData) => void;
}

export type IBaseInfoParam = Pick<IStoreConfig, 'id' | 'useConsole' | 'maxRecords' | 'onReport' | 'onDiscard'>

export type IStoreConfigOption = Partial<IStoreConfig>

export interface ILoggerOption extends Partial<IStoreConfig> {
    baseInfo?: IBaseInfo;
}

export type IDBConfig  = Pick<IStoreConfig, 'useConsole' | 'maxRecords'>

export type TWorkerType = 'closeDB' | 'add' | 'injectBaseInfo'
    | 'refreshTraceId' | 'refreshDurationStart' | 'injectConfig' | 'destory'
    | 'get' | 'getAll' | 'filter' | 'download' | 'count' | 'delete' | 'clear';

export interface IWorkerMessageCommon {
    msgid: string;
    type: TWorkerType;
}

export interface IWorkerMessage extends IWorkerMessageCommon{
    id?: string;
    data?: any;
}

export interface IWorkerBackMessage<T = any> extends IWorkerMessageCommon{
    id: string;
    result: T;
}