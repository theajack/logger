/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:53:23
 * @Description: Coding something
 */
import {IBaseInfoOption, IStoreConfig, IWorkerBackMessage, TWorkerType, IMessageData} from './type';
import {transformDOM} from './utils';
import WorkerCode from './worker/dist/worker.min';

function codeToBlob (code: string) {
    const blob = new window.Blob([code], {type: 'text/javascript'}); // 生成js文件对象
    const objectURL = window.URL.createObjectURL(blob); // 生成js文件的url
    return objectURL;
}
    
const worker = new window.Worker(codeToBlob(WorkerCode as any)); // 使用 blob对象的url
    
export class Stroe {
    useIndexedDB = !!window.indexedDB;
    canUse = !!window.indexedDB || !!window.localStorage;
    maxRecords: number;
    id: string;
    useStore: boolean;

    constructor ({
        useStore = true,
        id = 'default',
        localStorageFallback,
        maxRecords,
    }: IStoreConfig) {
        this.useStore = useStore;
        this.id = id;
        console.log(id, localStorageFallback);
        if (maxRecords) this.maxRecords = maxRecords;

        worker.onmessage = (e: {data: IWorkerBackMessage}) => {
            if (e.data.id === id) {
                this._onMessage(e.data);
            }
        };
    }

    private _onMessage (data: IWorkerBackMessage) {
        console.log('onmessage: id = ', this.id, data );
    }

    protected _add (data: IMessageData) {
        this._postMessage('add', this._transformPayload(data));
    }

    injectBaseInfo (baseInfo: IBaseInfoOption) {
        this._postMessage('injectBaseInfo', baseInfo);
    }

    get () {

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