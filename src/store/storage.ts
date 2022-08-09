
/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:03:49
 * @Description: Coding something
 */
import {BaseInfo} from '../common/base-info';
import {DBBase, TFilterOption} from '../common/db-base';
import {dataToLogString} from '../common/utils';
import {TLog} from '../common/t-log';
import {checkValue} from '../filter-json/filter';
import {IBaseInfoParam, ILogDBData, IMessageData, TLogStoreType} from '../type';

export class StorageStore extends DBBase {

    key: string;

    data: ILogDBData[] = []

    get useStorage (): boolean {
        return this.type === 'storage';
    }
    get useTemp (): boolean {
        return this.type === 'temp';
    }
    get noStore (): boolean {
        return this.type === 'none';
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
        this.type = storeType;
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

    add (data: IMessageData) {
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
        return Promise.resolve({
            discard,
            add: dbData
        });
    }
    close () {
        return Promise.resolve(true);
    }
    destory () {
        this.data = [];
        localStorage.removeItem(this.key);
        return Promise.resolve(true);
    }
    get (logid: string) : Promise<ILogDBData|null> {
        return Promise.resolve(this.data.find(d => d.logid === logid) || null);
    }

    clear () {
        this.data = [];
        this._saveAll();
        return Promise.resolve(true);
    }
    delete (logid: string) {
        const index = this.data.findIndex(item => item.logid === logid);

        if (index === -1) return Promise.resolve(false);
        this.data.splice(index, 1);
        this._saveAll();
        return Promise.resolve(true);
    }
    count () {
        return Promise.resolve(this.data.length);
    }

    download (filter?: TFilterOption | string) {
        let content = '';
        let count = 0;
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            if (checkValue(item, filter)) {
                count ++;
                content += (dataToLogString(item) + '\n');
            }
        }
        return Promise.resolve({content, count});
    }
    filter (filter?: TFilterOption | string): Promise<ILogDBData[]> {
        if (this.noStore) return Promise.resolve([]);

        return Promise.resolve(this.data.filter(d => {
            return checkValue(d, filter);
        }));
    }
    getAll (): Promise<ILogDBData[]> {
        if (this.noStore) return Promise.resolve([]);
        return Promise.resolve(this.data);
    }
}