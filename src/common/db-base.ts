/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:16:15
 * @Description: Coding something
 */
import {IBaseInfoOption, IBaseInfoParam, IJson, ILogData, ILogDBData, IMessageData} from '../type';
import {BaseInfo} from './base-info';

export type TFilterOption =
    (data: ILogDBData) => boolean |
    IJson |
    IJson[];


export abstract class DBBaseMethods {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor (data: IBaseInfoParam) {}
    abstract add (data?: IMessageData): Promise<any> | any;
    abstract close(): void;
    abstract destory(): void;
    abstract injectBaseInfo(data: IBaseInfoOption): void;
    abstract get(logid: string): Promise<ILogDBData | null>;
    abstract download(filter?: TFilterOption | string): Promise<string>;
    abstract filter(filter?: TFilterOption | string): Promise<ILogDBData[]>;
    abstract getAll(): Promise<ILogDBData[]>;
    abstract refreshTraceId(): void;
    abstract refreshDurationStart(): void;
}

export abstract class DBBase extends DBBaseMethods {

    baseInfo: BaseInfo;

    useConsole: boolean;

    get name () {
        return this.baseInfo.name;
    }

    constructor (data: IBaseInfoParam) {
        super(data);
        this.baseInfo = new BaseInfo(data);
    }
    abstract add (data?: ILogData): Promise<null | ILogDBData> | boolean;
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