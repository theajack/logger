/*
 * @Author: tackchen
 * @Date: 2022-07-30 18:08:43
 * @Description: Coding something
 */

import {IJson} from '../type';

export type filterAnd = Record<string, string | RegExp | Function>;

export type filterOr = filterAnd[];

export type filterMethod = (data: IJson) => boolean;

export type filterOption = filterAnd | filterMethod | filterOr;

export function checkValue (
    value: any,
    condition: any,
): boolean {
    if (typeof condition === 'function') {
        return condition(value);
    } else if (typeof value === 'object') {
        if (value.constructor.name === 'Object') {
            if (condition instanceof Array) {
                for (let i = 0; i < condition.length; i++) {
                    const filter = condition[i];
                    if (checkValue(value, filter)) return true;
                }
                return false;
            } else {
                for (const k in condition) {
                    const val = value[k];
                    const filter = condition[k];
                    if (!checkValue(val, filter)) return false;
                }
                return true;
            }
        } else {
            return value.toString() === condition.toString();
        }
    } else {
        if (condition instanceof RegExp) {
            return condition.test(value);
        }
        return value === condition;
    }
}

export function filterJsonArray (
    data: IJson[],
    condition: filterOption
) {
    const result: IJson[] = [];
    // 比filter方法性能好
    for (let i = 0; i < data.length; i++) {
        if (checkValue(data[i], condition)) {
            result.push(data[i]);
        }
    }
    return result;
}