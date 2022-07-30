/*
 * @Author: tackchen
 * @Date: 2022-07-24 16:35:16
 * @Description: Coding something
 */
export interface IJson<T=any> {
    [prop: string]: T;
}

export type TLogType = 'error' | 'log' | 'warn' | 'info';

export interface ILogDBData extends ILogData {
    uid: string;
    traceid: string;
    network: string;
    url: string;
    ua: string;
    msg: string;
    payload?: any;
    type: TLogType;

    time: string;
    timestamp: number;
    logid: string;
}

// 日志存储的数据
export type ILogData = Pick<
    ILogDBData,
    'uid' | 'traceid' | 'network' | 'url' | 'ua' |
    'msg' | 'payload' | 'type'
>

export type ILoggerConfig = Pick<
    ILogDBData,
    'uid' | 'traceid' | 'network'
>

export type ILoggerConfigOption = Partial<ILoggerConfig>

export interface IBaseInfo extends ILoggerConfig, Pick<ILogDBData, 'url' | 'ua'> {}

export type IBaseInfoOption = Partial<IBaseInfo>

export type IMessageData = Pick<
    ILogDBData,
    'msg' | 'payload' | 'type'
>

export type ILogString = string;


export interface IStoreConfig {
    id: string; // 作为dbName 使用，默认为location.hostname
    useStore: boolean;
    useConsole: boolean;
    useStorageInstead: boolean; // 如果不支持是否降级到localStorage存储数据 默认为false
    maxRecords: number; // 最大日志数量 默认不限制
    onReport?: (data: ILogDBData) => void;
}

export type IBaseInfoParam = Pick<IStoreConfig, 'id' | 'useConsole' | 'maxRecords' | 'onReport'>

export type IStoreConfigOption = Partial<IStoreConfig>

export interface ILoggerOption extends Partial<IStoreConfig> {
    baseInfo?: IBaseInfo;
}

export type IDBConfig  = Pick<IStoreConfig, 'useConsole' | 'maxRecords'>

export type TWorkerType = 'closeDB' | 'add' | 'injectBaseInfo'
    | 'refreshTraceId' | 'injectConfig';

export interface IWorkerMessage {
    type: TWorkerType;
    id?: string;
    data?: any;
}

export interface IWorkerBackMessage {
    type: TWorkerType;
    id: string;
    result: any;
}