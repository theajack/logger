
/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:03:49
 * @Description: Coding something
 */
import {BaseInfo} from '../common/base-info';
import {DBBase, TFilterOption} from '../common/db-base';
import {dataToLogString} from '../common/utils';
import {checkValue} from '../filter-json/filter';
import {IBaseInfoParam, ILogData, ILogDBData, TLogStoreType} from '../type';

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
            localStorage.setItem(this.key, JSON.stringify(this.data));
        }
    }

    add (data: ILogData): ILogDBData | null {
        if (!data) {
            console.warn('add: data is required');
            return null;
        }
        const dbData = this.baseInfo.appendBaseInfo(data);
        if (this.useTemp || this.useStorage) {
            this.data.push(dbData);
            this._saveAll();
        }
        return dbData;
    }

    close () {
        return true;
    }
    destory () {
        this.data = [];
        this._saveAll();
    }
    get (logid: string): ILogDBData | null {
        if (this.noStore) return null;
        return this.data.find(d => d.logid === logid) || null;
    }

    download (filter?: TFilterOption | string): string {
        if (this.noStore) return '';
        let result = '';
        
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            if (checkValue(item, filter)) {
                result += `${dataToLogString(item)}\\n`;
            }
        }
        return result;
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