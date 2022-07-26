/*
 * @Author: tackchen
 * @Date: 2022-07-24 15:53:23
 * @Description: Coding something
 */
import {ILogData, IStoreConfig, IWorkerBackMessage, IWorkerMessage} from './type';
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

    constructor ({
        id = 'default',
        localStorageFallback,
        maxRecords,
    }: IStoreConfig) {
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

    add (data: ILogData) {
        const message: IWorkerMessage = {
            type: 'add',
            id: this.id,
            data
        };
        worker.postMessage(message);
    }
}