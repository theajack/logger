
/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:03:49
 * @Description: Coding something
 */
import {BaseInfo} from '../common/base-info';
import {DBBase, IAddReturn, IDownloadInfo, TFilterOption} from '../common/db-base';
import {dataToLogString} from '../common/utils';
import {TLog} from '../common/t-log';
import {checkValue} from '../filter-json/filter';
import {IBaseInfoParam, ILogDBData, IMessageData, TLogStoreType} from '../type';

export class StorageStore extends DBBase {

    key: string;

    data: ILogDBData[] = []

    get useStorage (): boolean {
        return this.storeType === 'storage';
    }
    get useTemp (): boolean {
        return this.storeType === 'temp';
    }
    get noStore (): boolean {
        return this.storeType === 'none';
    }
    
    constructor (data: IBaseInfoParam & {storeType: TLogStoreType}) {
        super(data);
        this.key = `${BaseInfo.DEFAULT_DB_NAME_PREFIX}_${data.id}`;
        this.onDiscard = data.onDiscard;
        this.onReport = data.onReport;
        this._initStoreType(data.storeType);
        this.data = this._getAll();
    }

    private _initStoreType (storeType: TLogStoreType) {
        if (!window.localStorage && storeType === 'storage') {
            storeType = 'temp';
        }
        this.storeType = storeType;
    }

    private _getAll () {
        if (this.useStorage) {
            return JSON.parse(localStorage.getItem(this.key) || '[]');
        } else {
            return [];
        }
    }

    private _saveAll () {
        if (this.useStorage) {
            try {
                localStorage.setItem(this.key, JSON.stringify(this.data));
            } catch (e) {
                TLog.warn('localStorage 存储失败', e);
            }
        }
    }

    add (data: IMessageData): IAddReturn {
        const dbData = this.baseInfo.appendBaseInfo(data);
        let discard: ILogDBData | null = null;
        if (this.useTemp || this.useStorage) {
            const max = this.baseInfo.config.maxRecords;
            if (this.data.length >= max) {
                const item = this.data.shift();
                if (item) {
                    discard = item;
                    if (this.onDiscard) this.onDiscard(dbData);
                    TLog.warn(`达到最大存储数量：${max}; 已丢弃最早的记录：`, item);
                }
            }
            if (this.onReport) this.onReport(dbData);
            this.data.push(dbData);
            this._saveAll();
        }
        return {
            discard,
            add: dbData
        };
    }
    close () {
        return true;
    }
    destory () {
        this.data = [];
        localStorage.removeItem(this.key);
        return true;
    }
    get (logid: string): ILogDBData | null {
        if (this.noStore) return null;
        return this.data.find(d => d.logid === logid) || null;
    }

    clear (): boolean {
        this.data = [];
        this._saveAll();
        return true;
    }
    delete (logid: string) {
        const index = this.data.findIndex(item => item.logid === logid);

        if (index === -1) return false;
        this.data.splice(index, 1);
        this._saveAll();
        return true;
    }
    count (): number {
        return this.data.length;
    }

    download (filter?: TFilterOption | string): IDownloadInfo {
        let content = '';
        let count = 0;
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            if (checkValue(item, filter)) {
                count ++;
                content += (dataToLogString(item) + '\n');
            }
        }
        return {content, count};
    }
    filter (filter?: TFilterOption | string): ILogDBData[] {
        if (this.noStore) return [];

        return this.data.filter(d => {
            return checkValue(d, filter);
        });
    }
    getAll (): ILogDBData[] {
        if (this.noStore) return [];
        return this.data;
    }
}