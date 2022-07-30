import {IBaseInfo, IBaseInfoOption, IBaseInfoParam, IDBConfig, ILogData, ILogDBData} from '../type';
import {dataToLogString, dateToStr, uuid} from './utils';

/*
 * @Author: tackchen
 * @Date: 2022-07-30 13:05:39
 * @Description: Coding something
 */
export class BaseInfo {
    static DEFAULT_DB_NAME_PREFIX = 'tc_logger';
    name: string;

    data: IBaseInfo = {
        uid: '',
        traceid: '',
        network: '',
        url: '',
        ua: '',
    };

    config: IDBConfig = {
        useConsole: true,
        maxRecords: -1, // todo
    };

    constructor ({
        id,
        useConsole,
        maxRecords
    }: IBaseInfoParam) {
        this.injectConfig({useConsole, maxRecords});
        this.name = `${BaseInfo.DEFAULT_DB_NAME_PREFIX}_${id}`;
        this.refreshTraceId();
    }

    refreshTraceId () {
        this.data.traceid = uuid();
    }

    injectBaseInfo (baseInfo: IBaseInfoOption) {
        Object.assign(this.data, baseInfo);
    }
    
    injectConfig (data: Pick<IBaseInfoParam, 'useConsole' | 'maxRecords'>) {
        Object.assign(this.config, data);
    }

    appendBaseInfo (data: ILogData): ILogDBData {
        const date = new Date();
        const timestamp = date.getTime();
        const time = dateToStr(date);
        const result = Object.assign(data, this.data, {
            timestamp,
            time,
            logid: uuid(),
        });

        if (this.config.useConsole) {
            const str = dataToLogString(result);
            const fn = (console as any)[result.type] || console.log;
            fn(str);
        }

        return result;
    }
    
}