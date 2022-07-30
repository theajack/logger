/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:28:38
 * @Description: Coding something
 */
import {DBBaseMethods} from '../common/db-base';
import {codeToBlob, transformDOM} from '../common/utils';
import {IBaseInfoOption, IBaseInfoParam, ILogDBData, IMessageData, IWorkerBackMessage, TWorkerType} from '../type';
import WorkerCode from '../worker/dist/worker.min';

let worker: Worker;
    
if (window.Worker) {
    worker = new window.Worker(codeToBlob(WorkerCode as any)); // 使用 blob对象的url
}

export class WorkerStore extends DBBaseMethods {
    id: string;
    onReport?: (data: ILogDBData) => void;
    constructor ({
        id,
        useConsole,
        maxRecords,
        onReport
    }: IBaseInfoParam) {
        super({
            id,
            useConsole,
            maxRecords,
        });
        this.onReport = onReport;

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
            // console.log('onmessage: id = ', this.id, data );
            if (this.onReport) {
                this.onReport(data.result as ILogDBData);
            }
        }
    }

    injectBaseInfo (baseInfo: IBaseInfoOption) {
        this._postMessage('injectBaseInfo', baseInfo);
    }

    add (data: IMessageData): Promise<boolean> | boolean {
        this._postMessage('add', this._transformPayload(data));
        return true;
    }
    close () {
        
    }
    destory () {
        
    }

    refreshTraceId () {
        this._postMessage('refreshTraceId');
    }

    protected _postMessage (type: TWorkerType, data: any = null) {
        const message = {
            type,
            id: this.id,
            data
        };
        worker.postMessage(message);
    }

    private _transformPayload (data: IMessageData) {
        if (data.payload instanceof window.HTMLElement) {
            data.payload = transformDOM(data.payload);
        }
        return data;
    }

}