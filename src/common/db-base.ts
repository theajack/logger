/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:16:15
 * @Description: Coding something
 */
import {IBaseInfoOption, IBaseInfoParam, IDownloadOptions, IJson, ILogDBData, IMessageData, TLogStoreType} from '../type';
import {BaseInfo} from './base-info';

export type TFilterOption =
    (data: ILogDBData) => boolean |
    IJson |
    IJson[];
 
export interface IDownloadInfo {
    content: string;
    count: number;
}

export type IAddReturn = {
    discard: ILogDBData | null;
    add: ILogDBData;
} | null

export abstract class DBBaseMethods {
  type: TLogStoreType;
  onReport?: (data: ILogDBData) => void;
  onDiscard?: (data: ILogDBData) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor (data: IBaseInfoParam) {this.type = 'idb';}
    abstract add (data?: IMessageData): Promise<IAddReturn>;
    abstract close(): Promise<boolean>;
    abstract destory(): Promise<boolean>;
    abstract get(logid: string): Promise<ILogDBData | null>;
    abstract download(data: IDownloadOptions): Promise<IDownloadInfo>;
    abstract filter(filter?: TFilterOption | string): Promise<ILogDBData[]>;
    abstract getAll(): Promise<ILogDBData[]>;
    abstract count(): Promise<number>;
    abstract clear(): Promise<boolean>;
    abstract delete(logid: string): Promise<boolean>;
    abstract injectBaseInfo(data: IBaseInfoOption): Promise<void>;
    abstract refreshTraceId(): Promise<void>;
    abstract refreshDurationStart(): Promise<void>;
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
  injectBaseInfo (data: IBaseInfoOption) {
    this.baseInfo.injectBaseInfo(data);
    return Promise.resolve();
  }
  refreshTraceId () {
    this.baseInfo.refreshTraceId();
    return Promise.resolve();
  }
  refreshDurationStart () {
    this.baseInfo.refreshDurationStart();
    return Promise.resolve();
  }
}