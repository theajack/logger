/*
 * @Author: tackchen
 * @Date: 2022-07-24 17:44:42
 * @Description: Coding something
 */
import {Logger} from '../src/index';

const win = (window as any);

// const lg = new Logger({
//     id: 'main',
//     storeType: 'idb',
//     onReport (d) {
//         console.warn('onReport', d);
//     },
//     maxRecords: 10,
// });

// const lg2 = new Logger<'sync'>({
//     id: 'main',
//     storeType: 'storage',
//     onReport (d) {
//         console.warn('onReport', d);
//     },
//     maxRecords: 10,
// });

win.lg = new Logger({
    id: 'main',
    storeType: 'idb',
    onReport (d) {
        console.warn('onReport', d);
    },
    maxRecords: 10,
});

win.lg2 = new Logger({
    id: 'main',
    storeType: 'temp',
    onReport (d) {
        console.warn('onReport', d);
    },
    maxRecords: 10,
});

// const num = lg2.count();

// lg.info('121')?.add;

// const d1 = lg.log('111');
// const d2 = lg.count();
// const d3 = lg.download();

// await lg.refreshTraceId();


win.Logger = Logger;
// win.lg = lg;
// win.lg2 = lg2;

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

    