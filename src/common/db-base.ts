/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:16:15
 * @Description: Coding something
 */
import {IBaseInfoOption, IBaseInfoParam, IJson, ILogData, ILogDBData, IMessageData, TLogStoreType} from '../type';
import {BaseInfo} from './base-info';

export type TFilterOption =
    (data: ILogDBData) => boolean |
    IJson |
    IJson[];


export abstract class DBBaseMethods {
    type: TLogStoreType;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor (data: IBaseInfoParam) {}
    abstract add (data?: IMessageData): Promise<any> | any;
    abstract close(): void;
    abstract destory(): void;
    abstract injectBaseInfo(data: IBaseInfoOption): void;
    abstract get(logid: string): Promise<ILogDBData | null> | ILogDBData | null;
    abstract download(filter?: TFilterOption | string): Promise<string> | string;
    abstract filter(filter?: TFilterOption | string): Promise<ILogDBData[]> | ILogDBData[];
    abstract getAll(): Promise<ILogDBData[]> | ILogDBData[];
    abstract refreshTraceId(): void;
    abstract refreshDurationStart(): void;
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
    abstract add (data?: ILogData): ILogDBData | null | Promise<null | ILogDBData> | boolean;
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