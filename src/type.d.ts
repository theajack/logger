/*
 * @Author: tackchen
 * @Date: 2022-07-24 16:35:16
 * @Description: Coding something
 */
export interface IJson<T=any> {
    [prop: string]: T;
}

export interface ILogDataConfig {
    uid: string;
    traceid: string;
    network: string;
}


export interface IBaseInfo extends ILogDataConfig, IJson {
    url: string;
    ua: string;
}

export type IBaseInfoOption = {
    [key in keyof IBaseInfo]?: IBaseInfo[key]
}

export interface IMessageData {
    msg: string;
    payload?: any;
    type: 'error' | 'log';
}

// 日志存储的数据
export interface ILogData extends IBaseInfo, IMessageData {
}

export interface ILogDBData extends ILogData {
    time: string;
    timestamp: number;
    logid: string;
}

export type ILogString = string;

export type IBaseInfoOptions = {
    [prop in keyof ILogDataConfig]?: ILogDataConfig[prop];
}

export interface IStoreConfig {
    useStore?: boolean;
    id?: string; // 作为dbName 使用，默认为location.hostname
    localStorageFallback?: boolean; // 如果不支持是否降级到localStorage存储数据 默认为false
    maxRecords?: number; // 最大日志数量 默认不限制
}

export interface ILoggerOptions extends IBaseInfoOptions, IStoreConfig {
    baseInfo?: IBaseInfo;
    useConsole?: boolean;
    onReport?(): void;
}

export interface IDBConfig {
    useConsole?: boolean;
    maxRecords?: number; // 最大日志数量 默认不限制
}

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
    success: boolean;
}