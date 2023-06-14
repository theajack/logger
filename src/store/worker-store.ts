/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:28:38
 * @Description: Coding something
 */
import {DBBaseMethods, IAddReturn, IDownloadInfo, TFilterOption} from '../common/db-base';
import {codeToBlob, transformDOM} from '../common/utils';
import {IBaseInfoOption, IBaseInfoParam, IDownloadOptions, IJson, ILogDBData, IMessageData, IWorkerBackMessage, TWorkerType} from '../type';
import WorkerCode from '../worker/dist/worker.min';
import {FuncFilter} from '../filter-json/func-filter';

let msgid = 0;
let worker: Worker;
    
if (typeof window !== 'undefined' && window.Worker) {
  worker = new window.Worker(codeToBlob(WorkerCode as any)); // 使用 blob对象的url
}
 
export class WorkerStore extends DBBaseMethods {
  id: string;
  resolveMap: IJson<Function> = {};
  constructor ({
    id,
    useConsole,
    maxRecords,
    onReport,
    onDiscard,
    onError,
  }: IBaseInfoParam) {
    super({
      id,
      useConsole,
      maxRecords,
    });
    this.onDiscard = onDiscard;
    this.onReport = onReport;
    this.onError = onError;

    this.id = id;
    if (!worker) {
      worker = new window.Worker(codeToBlob(WorkerCode as any)); // 使用 blob对象的url
    }
    worker.onmessage = ({data}: {data: IWorkerBackMessage}) => {
      if (data.id === id) {
        this._onMessage(data);
      }
    };
    this._postMessage('injectConfig', {
      useConsole,
      maxRecords
    });
  }

  private _onMessage (data: IWorkerBackMessage) {
    if (data.type === 'add') {
      const result = data.result;
      if (result) {
        if (this.onReport) this.onReport(result.add);
        if (result.discard) {
          if (this.onDiscard) this.onDiscard(result.discard);
        }
      }
    } else if (data.type === 'error') {
      if (this.onError) this.onError(data.result);
    }
    if (data.msgid) {
      const resolve = this.resolveMap[data.msgid];
      if (resolve) {
        resolve(data);
        delete this.resolveMap[data.msgid];
      }
    }
  }

  injectBaseInfo (baseInfo: IBaseInfoOption) {
    return this._postMessage('injectBaseInfo', baseInfo);
  }

  async add (data: IMessageData): Promise<IAddReturn> {
    return (await this._postMessage('add', this._transformPayload(data))).result;
  }
  close () {
    return this._postMessage('closeDB');
  }
  destory () {
    return this._postMessage('destory');
  }

  async count (): Promise<number> {
    return (await this._postMessage('count')).result;
  }
  clear () {
    return this._postMessage('clear');
  }
  delete (logid: string) {
    return this._postMessage('delete', logid);
  }

  refreshTraceId () {
    return this._postMessage('refreshTraceId');
  }

  refreshDurationStart () {
    return this._postMessage('refreshDurationStart');
  }

  async get (logid: string): Promise<ILogDBData> {
    return (await this._postMessage('get', logid)).result;
  }

  async getAll (): Promise<ILogDBData[]> {
    return (await this._postMessage('getAll')).result;
  }

  async download ({filter, keys}: IDownloadOptions): Promise<IDownloadInfo> {
    return (await this._postMessage('download', {
      filter: FuncFilter.transFunc(filter),
      keys,
    })).result;
  }

  async filter (filter?: TFilterOption): Promise<ILogDBData[]> {
    return (await this._postMessage('filter', FuncFilter.transFunc(filter))).result;
  }

  protected _postMessage (type: TWorkerType, data: any = null): Promise<any> {
    return new Promise(resolve => {
      const message = {
        msgid: msgid++,
        type,
        id: this.id,
        data
      };
      this.resolveMap[message.msgid] = resolve;
      worker.postMessage(message);
    });
  }

  private _transformPayload (data: IMessageData) {
    if (data.payload instanceof window.HTMLElement) {
      data.payload = transformDOM(data.payload);
    }
    return data;
  }

}