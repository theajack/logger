/*
 * @Author: tackchen
 * @Date: 2022-08-03 20:32:39
 * @Description: Coding something
 */

import Logger from '../../src/index';
// import Logger from '../../npm';

const win = window as any;

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
  storeType: 'storage',
  onReport (d) {
    console.warn('onReport', d);
  },
  maxRecords: 10,
});