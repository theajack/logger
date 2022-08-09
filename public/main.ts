/*
 * @Author: tackchen
 * @Date: 2022-07-24 17:44:42
 * @Description: Coding something
 */
import {Logger} from '../src/index';
import {StorageStore} from '../src/store/storage';

const win = (window as any);

const lg = new Logger<StorageStore>({
    id: 'main',
    storeType: 'storage',
    onReport (d) {
        console.warn('onReport', d);
    },
    maxRecords: 10,
});

const res = lg.store.add({} as any);
console.log(res);

const data = lg.log('111');

const d1 = lg._logCommon(['11'], 'log');

const d2 = lg.count();
const d3 = lg.store.count();

win.Logger = Logger;
win.lg = lg;

// lg.injectBaseInfo({a: 11});

// lg.log()

// lg.log('1111');
// lg.refreshTraceId();
// lg.log('2222');
// lg.refreshTraceId();
// lg.log('3333');

// lg.injectBaseInfo({
//     uid: 'xx',
//     ua: '111',
//     url: '222',
//     network: '4g',
//     traceid: '----'
// });
// lg.log('4444');

    