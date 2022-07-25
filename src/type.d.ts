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
}

// 日志存储的数据
export interface ILogData extends IBaseInfo {
    msg: string;
    payload?: any;
    type: 'error' | 'log';
    time: string;
    timestamp: number;
}

export type ILogString = string;

export type ILogDataConfigOptions = {
    [prop in keyof ILogDataConfig]?: ILogDataConfig[prop];
}

export interface IStoreConfig {
    id?: string; // 作为dbName 使用，默认为location.hostname
    localStorageFallback?: boolean; // 如果不支持是否降级到localStorage存储数据 默认为false
    maxRecords?: number; // 最大日志数量 默认不限制
}

export interface ILoggerOptions extends ILogDataConfigOptions, IStoreConfig {
    baseInfo?: IBaseInfo;
    useConsole?: boolean;
    useStore?: boolean;
    onReport?(): void;
}