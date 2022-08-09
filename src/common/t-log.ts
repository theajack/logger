/*
 * @Author: tackchen
 * @Date: 2022-08-01 08:03:29
 * @Description: Coding something
 */

import {TLogType} from 'src/type';


const HEADER = '[TCLogger]:';

function logBase (args: any[], type: TLogType) {
    const first = args[0];
    if (typeof first === 'string' || typeof first === 'string') {
        args[0] = HEADER + first;
    } else {
        args.unshift(HEADER);
    }
    console[type](...args);
}

export const TLog = {
    log (...args: any[]) {
        logBase(args, 'log');
    },
    warn (...args: any[]) {
        logBase(args, 'warn');
    },
    info (...args: any[]) {
        logBase(args, 'info');
    },
    error (...args: any[]) {
        logBase(args, 'error');
    }
};