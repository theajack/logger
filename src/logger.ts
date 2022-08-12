/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:52:13
 * @Description: Coding something
 */
import {
  IJson, IBaseInfoOption, IMessageData, TLogType,
  IBaseInfoParam, IStoreConfig, TLogStoreType, IDownloadOptions
} from './type';
import {dateToStr, download, isJson, uuid} from './common/utils';
import {
  ILoggerOption,
} from './type';
import {DBBaseMethods, TFilterOption} from './common/db-base';
import {WorkerStore} from './store/worker-store';
import {StorageStore} from './store/storage';
import version from './version';

class Logger {
  static version: string = version;
  private _store: DBBaseMethods;
  id: string;
  storeType: TLogStoreType;

  constructor ({
    id = 'default',
    useConsole = true,
    storeType = 'idb',
    maxRecords = 10000,
    baseInfo,
    onReport,
    onDiscard,
  }: ILoggerOption = {}) {
        
    this._store = LoggerHelper.initStore({
      id,
      storeType,
      maxRecords,
      useConsole,
      onReport,
      onDiscard,
    });

    this.storeType = this._store.type;

    this.id = id;
    this.injectBaseInfo(baseInfo);
  }

  injectBaseInfo (baseInfo: IBaseInfoOption & IJson = {}) {
    baseInfo.uid = LoggerHelper.initUUid('_tc_logger_uid', baseInfo?.uid);
    baseInfo.clientid = LoggerHelper.initUUid('_tc_logger_clientid', baseInfo?.clientid);
    baseInfo.url = baseInfo.url || window.location.href;
    baseInfo.ua = baseInfo.ua || window.navigator.userAgent;
    return this._store.injectBaseInfo(baseInfo);
  }

  log (...args: any[]) {
    return this._logCommon(args, 'log');
  }
  error (...args: any[]) {
    return this._logCommon(args, 'error');
  }
  warn (...args: any[]) {
    return this._logCommon(args, 'warn');
  }
  info (...args: any[]) {
    return this._logCommon(args, 'info');
  }
  private _logCommon (args: any[], type: TLogType) {
    const data = LoggerHelper.buildLogData(args, type);
    return this._store.add(data);
  }
  close () {
    return this._store.close();
  }
  destory () {
    return this._store.destory();
  }
  clear () {
    return this._store.clear();
  }
  count () {
    return this._store.count();
  }
  delete (logid: string) {
    return this._store.delete(logid);
  }

  refreshTraceId () {
    return this._store.refreshTraceId();
  }

  refreshDurationStart () {
    return this._store.refreshDurationStart();
  }

  // 下载日志
  async download ({
    name, filter, keys
  }: IDownloadOptions) {

    if (!name) name = dateToStr(new Date(), '_');
        
    const {content, count} = await this._store.download({filter, keys});

    download({name: `${name}.log`, content});
    return count;
  }

  get (logid: string) {
    return this._store.get(logid);
  }

  getAll () {
    return this._store.getAll();
  }


  filter (filter?: TFilterOption) {
    if (!filter) {
      return this.getAll();
    }
    return this._store.filter(filter);
  }
}

const LoggerHelper = {
  buildLogData (args: any[], type: TLogType = 'log'): IMessageData {
    let msg = '__def__';
    let payload: any = args;
    let extend: IJson | undefined = undefined;
    const arg1 = args[0];
    const arg1Type = typeof arg1;
    if (arg1Type === 'string' || arg1Type === 'number') {
      msg = `${arg1}`;
      payload = args.slice(1);
    } else if (args.length === 1 && isJson(arg1) ) {
      extend = arg1;
      payload = [];
    }
    const data: IMessageData = {
      msg,
      type,
      extend
    };
    if (payload.length > 0) {
      data.payload = payload;
    }
    return data;
  },
  initUUid (key: string, id?: string): string {
    if (id) {
      window.localStorage.setItem(key, id);
      return id;
    } else {
      let id = window.localStorage.getItem(key);
      if (!id) {
        id = uuid();
        window.localStorage.setItem(key, id);
      }
      return id;
    }
  },
  initStore ({
    id,
    storeType,
    maxRecords,
    useConsole,
    onReport,
    onDiscard,
  }: IStoreConfig) {
    const canUseIndexedDB = !!window.Worker && !!window.indexedDB;
    const options: IBaseInfoParam = {id, useConsole, maxRecords, onReport, onDiscard};
        
    if (storeType === 'idb' && canUseIndexedDB) {
      return new WorkerStore(options);
    } else {
      return new StorageStore({
        ...options,
        storeType
      });
    }
  }
};

export default Logger;