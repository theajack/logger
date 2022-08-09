/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:16:15
 * @Description: Coding something
 */
import {IBaseInfoOption, IBaseInfoParam, IJson, ILogDBData, IMessageData, TLogStoreType} from '../type';
import {BaseInfo} from './base-info';

export type TFilterOption =
    (data: ILogDBData) => boolean |
    IJson |
    IJson[];

type DBAsyncReturn<T = any> = Promise<T> | T;
type DBsyncReturn<T = any> = T;

export type IAddReturn = {
    discard: ILogDBData | null;
    add: ILogDBData;
} | null

export abstract class DBBaseMethods <T extends DBAsyncReturn = any> {
    type: TLogStoreType;
    onReport?: (data: ILogDBData) => void;
    onDiscard?: (data: ILogDBData) => void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor (data: IBaseInfoParam) {}
    abstract add (data?: IMessageData): DBAsyncReturn<IAddReturn>;
    abstract close(): T extends DBsyncReturn ? DBsyncReturn<void>: DBAsyncReturn<void>;
    abstract destory(): DBAsyncReturn<void>;
    abstract injectBaseInfo(data: IBaseInfoOption): void;
    abstract get(logid: string): DBAsyncReturn<ILogDBData | null>;
    abstract download(filter?: TFilterOption | string): DBAsyncReturn<string>;
    abstract filter(filter?: TFilterOption | string): DBAsyncReturn<ILogDBData[]>;
    abstract getAll(): DBAsyncReturn<ILogDBData[]>;
    abstract count(): DBAsyncReturn<number>;
    abstract clear(): DBAsyncReturn<boolean>;
    abstract delete(logid: string): DBAsyncReturn<boolean>;
    abstract refreshTraceId(): DBAsyncReturn<void>;
    abstract refreshDurationStart(): DBAsyncReturn<void>;
}

export abstract class DBBase extends DBBaseMethods {

    baseInfo: BaseInfo;

    useConsole: boolean;

    storeType: TLogStoreType = 'idb';

    get name () {
        return this.baseInfo.name;
    }

    constructor (data: IBaseInfoParam) {
        super(data);
        this.baseInfo = new BaseInfo(data);
    }
    injectBaseInfo (data: IBaseInfoOption) {
        this.baseInfo.injectBaseInfo(data);
    }
    refreshTraceId () {
        this.baseInfo.refreshTraceId();
    }
    refreshDurationStart () {
        this.baseInfo.refreshDurationStart();
    }
}

export abstract class SyncDBBase extends DBBase {
    abstract add (data?: IMessageData): DBAsyncReturn<IAddReturn>
    abstract close(): DBAsyncReturn<void>;
    abstract destory(): DBAsyncReturn<void>;
    abstract injectBaseInfo(data: IBaseInfoOption): void;
    abstract get(logid: string): DBAsyncReturn<ILogDBData | null>;
    abstract download(filter?: TFilterOption | string): DBAsyncReturn<string>;
    abstract filter(filter?: TFilterOption | string): DBAsyncReturn<ILogDBData[]>;
    abstract getAll(): DBAsyncReturn<ILogDBData[]>;
    abstract count(): DBAsyncReturn<number>;
    abstract clear(): DBAsyncReturn<boolean>;
    abstract delete(logid: string): DBAsyncReturn<boolean>;
    abstract refreshTraceId(): void;
    abstract refreshDurationStart(): void;
}