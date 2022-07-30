/*
 * @Author: tackchen
 * @Date: 2022-07-24 17:44:42
 * @Description: Coding something
 */
import {Logger} from '../src/index';

const win = (window as any);

const lg = new Logger({
    id: 'main',
    onReport (d) {
        console.warn('onReport', d);
    }
});
win.Logger = Logger;
win.lg = lg;

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

    