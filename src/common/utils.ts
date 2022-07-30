import {ILogDBData} from 'src/type';

/*
 * @Author: tackchen
 * @Date: 2022-07-24 16:27:54
 * @Description: Coding something
 */
export function uuid () {
    const s: string[] = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);

    s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr(((s[19] as any) & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = '-';
    s[13] = '-';
    s[18] = '-';
    s[23] = '-';
    const uuid = s.join('');
    return uuid;
}

export function transformDOM (value: HTMLElement) {
    const attributes = value.attributes;
    let attrs = '';
    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        attrs += ` ${attr.name}="${attr.value}"`;
    }
    return `<${value.tagName.toLowerCase()}${attrs}/>`;
}

export function toLogString (value: any): string {
    if (typeof value === 'object') {
        return JSON.stringify(value);
    } else {
        return value.toString();
    }
}

export function dateToStr (date: Date): string {
    const dateStr = `${date.getFullYear()}-${fn(date.getMonth() + 1)}-${fn(date.getDate())}`;
    const ms = date.getMilliseconds();
    const msStr = ms < 100 ? `0${fn(ms)}` : ms;
    return `${dateStr} ${fn(date.getHours())}:${fn(date.getMinutes())}:${fn(date.getSeconds())}:${msStr}`;
}

function fn (num: number) {
    return num < 10 ? (`0${num}`) : num;
}

export function codeToBlob (code: string) {
    const blob = new window.Blob([code], {type: 'text/javascript'}); // 生成js文件对象
    const objectURL = window.URL.createObjectURL(blob); // 生成js文件的url
    return objectURL;
}

export function dataToLogString (data: ILogDBData) {
    const payload = typeof data.payload !== 'undefined' ? ` payload=${toLogString(data.payload)};` : '';
    const network = data.network ? ` network=${data.network};` : '';
    return `[${data.time}]:${data.type === 'error' ? '[error]' : ''} msg=${data.msg}; uid=${data.uid}; traceid=${data.traceid}; logid=${data.logid}${network}${payload}`;
}