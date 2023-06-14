<!--
 * @Author: tackchen
 * @Date: 2022-08-03 21:24:33
 * @Description: Coding something
-->

# [idb-logger](https://github.com/theajack/logger)

<p>
    <a href="https://www.github.com/theajack/logger/stargazers" target="_black">
        <img src="https://img.shields.io/github/stars/theajack/logger?logo=github" alt="stars" />
    </a>
    <a href="https://www.github.com/theajack/logger/network/members" target="_black">
        <img src="https://img.shields.io/github/forks/theajack/logger?logo=github" alt="forks" />
    </a>
    <a href="https://www.npmjs.com/package/idb-logger" target="_black">
        <img src="https://img.shields.io/npm/v/idb-logger?logo=npm" alt="version" />
    </a>
    <a href="https://www.npmjs.com/package/idb-logger" target="_black">
        <img src="https://img.shields.io/npm/dm/idb-logger?color=%23ffca28&logo=npm" alt="downloads" />
    </a>
    <a href="https://www.jsdelivr.com/package/npm/idb-logger" target="_black">
        <img src="https://data.jsdelivr.com/v1/package/npm/idb-logger/badge" alt="jsdelivr" />
    </a>
    <a href="https://github.com/theajack/logger/issues"><img src="https://img.shields.io/github/issues-closed/theajack/logger.svg" alt="issue"></a>
</p>
<p>
    <a href="https://github.com/theajack" target="_black">
        <img src="https://img.shields.io/badge/Author-%20theajack%20-7289da.svg?&logo=github" alt="author" />
    </a>
    <a href="https://www.github.com/theajack/logger/blob/master/LICENSE" target="_black">
        <img src="https://img.shields.io/github/license/theajack/logger?color=%232DCE89&logo=github" alt="license" />
    </a>
    <a href="https://cdn.jsdelivr.net/npm/idb-logger/idb-logger.min.js"><img src="https://img.shields.io/bundlephobia/minzip/idb-logger.svg" alt="Size"></a>
    <a href="https://github.com/theajack/logger/search?l=javascript"><img src="https://img.shields.io/github/languages/top/theajack/logger.svg" alt="TopLang"></a>
    <a href="https://www.github.com/theajack/logger"><img src="https://img.shields.io/librariesio/dependent-repos/npm/idb-logger.svg" alt="Dependent"></a>
    <a href="https://github.com/theajack/logger/blob/master/test/test-report.txt"><img src="https://img.shields.io/badge/test-passed-44BB44" alt="test"></a>
</p>

<h3>🚀 A high-performance, high-capacity, and highly scalable web-side logging system based on WebWorker and indexedDB</h3>

**[Online use](https://shiyix.cn/jsbox?github=theajack.logger) | [中文](https://github.com/theajack/logger/blob/master/README.cn.md) | [Changelog](https://github.com/theajack/logger/blob/master/scripts/version.md) | [issue feedback](https://github.com/theajack/logger/issues/new) | [Gitee](https://gitee.com/theajack/logger)**

## 0. Introduction

idb-logger is committed to helping web developers access a high-performance logging system conveniently and efficiently. Relying on webworker and indexedDB technologies, web applications can store large-capacity logs in the browser in a way that hardly affects the user experience, and Report it to the server at the right time, or download it by the user.

### 0.1 Features

1. Support WebWorker + indexedDB to store logs
2. Three log storage modes can be selected, and when not supported, the supported mode will be automatically selected down
3. Support no storage mode, only use idb-logger as a log generation tool
4. Support to define the maximum number of storage logs, the oldest records will be automatically deleted
5. Support download log
6. Support query log, support multiple query modes
7. Support custom basic data
8. Support custom reporting based on onReport callback

## 1. Quick use

### 1.0 install

#### 1.0.1 npm install

```
npm i idb-logger
```

```js
import Logger from 'idb-logger';
```

#### 1.0.2 cdn

```html
<script src="https://cdn.jsdelivr.net/npm/idb-logger/idb-logger.min.js"></script>
<script>
  window.IDBLogger;
</script>
```

### 1.1 Quick use


```js
const logger = new Logger();

logger.log('an ordinary log');
logger.error('an error log', 'additional information', {type: 'additional information'});

logger.log('start').then(({discard, add})=>{
    // add is log detail
    // If maxRecords is reached, discard is a discarded log, otherwise null
})

logger.download(); // download log
```

### 1.2. API introduction

ts declaration:

```ts
declare class Logger {
    static version: string;
    private_store;
    id: string;
    storeType: TLogStoreType;
    constructor({ id, useConsole, storeType, maxRecords, baseInfo, onReport, onDiscard, }?: ILoggerOption);
    injectBaseInfo(baseInfo?: IBaseInfoOption & IJson): Promise<void>;
    log(...args: any[]): Promise<IAddReturn>;
    error(...args: any[]): Promise<IAddReturn>;
    warn(...args: any[]): Promise<IAddReturn>;
    info(...args: any[]): Promise<IAddReturn>;
    private _logCommon;
    close(): Promise<boolean>;
    destory(): Promise<boolean>;
    clear(): Promise<boolean>;
    count(): Promise<number>;
    delete(logid: string): Promise<boolean>;
    refreshTraceId(): Promise<void>;
    refreshDurationStart(): Promise<void>;
    download({ name, filter }?: {
        name?: string;
        filter?: TFilterOption;
        keys?: string[];
    }): Promise<number>;
    get(logid: string): Promise<ILogDBData | null>;
    getAll(): Promise<ILogDBData[]>;
    filter(filter?: TFilterOption): Promise<ILogDBData[]>;
}
```

complete logdata

```ts
interface ILogDBData {
    uid: string; // user id will be stored in storage
    clientid: string; // client id will be stored in storage
    traceid: string; // This access id can be refreshed by refreshTraceId
    network: string; // network status
    url: string; // current url
    ua: string; // browser ua

    msg: string; // message type, if the first parameter of log is a string, take this value
    payload?: any; // other parameters of log
    type: TLogType; // log info warn error
    duration: number; // The time when the page enters the current log, you can refresh the timing at seven o'clock through refreshDurationStart
    time: string; // time string
    timestamp: number; // timestamp
    logid: string; // log unique id
}
```

#### 1.2.1 Constructor

```ts
new Logger({
  id, // Specify the database name Default value: default
  useConsole, // whether to print to the console default true
  storeType, // storage mode, default idb, support idb storage temp none
  maxRecords, // maximum number of stored records default 10000
  baseInfo, // inject custom base information
  onReport, // Triggered when the log is generated, can be used to customize the report data
  onDiscard, // Triggered when maxRecords is reached, discarded data
  onError, // error listener
});
```

declaration

```ts
interface ILoggerOption extends Partial<IStoreConfig> {
    id?: string;
    useConsole?: boolean;
    storeType?: TLogStoreType;
    maxRecords?: number;
    baseInfo?: IBaseInfo;
    onReport?: (data: ILogDBData) => void;
    onDiscard?: (data: ILogDBData) => void;
    onError?: (err: ILogError) => void;
}
```

1. storeType

idb means using indexedDB to store logs, storage means using localStorage to store logs, temp means using js variables to store data (non-persistent), none means not storing data (only using idb-logger as a log generation tool)

The default value is idb. When a certain storage type is not supported by the browser, the next mode will be automatically selected backward.

2. maxRecords

In order to reduce client performance consumption, you can specify a maximum storage amount. When this amount is exceeded, the logger will automatically delete the oldest record and trigger the onDiscard callback

3. baseInfo

Accepts a json, which is used to inject the basic information of the log. When the name is consistent with the default baseInfo, the default baseInfo will be overwritten

Default baseInfo `clientid, uid, traceid, network, url, ua`

#### 1.2.2 Logging

There are four methods on the logger object: log, error, warn, info

The usage method is similar to support the incoming of any amount and any type of data

parameter rules

1. When the first parameter is a string or a number, the parameter is used as the msg field of the log, and all the following parameters are combined into an array as the payload attribute
2. When the first parameter is json and there is only one parameter, all the properties in the json will be overwritten to the properties of the log
3. When the first parameter is not a number or a string, the default value __def__ will be used as msg, and all parameters will be combined into an array as the payload attribute
   

```ts
await logger.log('start'); // Return Promise<{discard, add}> add is the added log data. The call method conforms to rule 1
await logger.info({
    msg: 'start', // write message
    time: 'xxxx', // Override log properties
    your_custom: 'xxxx', // custom properties
}); // This call method conforms to rule 2
await logger.warn({}, [], '', 1); // This call method conforms to rule 3
await logger.error('error', {}, [], '', 1); // This call method conforms to rule 1
```

#### 1.2.3 Query

```ts
await logger.filter(filter); // return Promise
```

filter supports three modes

1. Filter

Support to pass in a function `(data: ILogDBData) => boolean`, the callback function is the log data, return true or false to indicate whether the data hits

Note: In indexedDB mode, since the function will be passed to the worker for execution, it is required that other methods or features not supported in the worker cannot be called in the function.

```ts
await logger.filter(item=>{
    return item.msg.includes('xxx') && item.type === 'log';
})
```

2. AND (incoming json)

Pass in a json, each attribute will be used and String together, supports regular expressions

```ts
await logger.filter({
    msg: /xxx/i,
    type: 'log',
})
```

3. OR (pass in json array)

Pass in a json array, each element in the array is connected with or logic, and the and logic is used between the attributes within the element, which is consistent with 2

```ts
await logger.filter([{
    msg: /xxx/i,
}, {
    type: 'log',
}])
```

The above statement means that msg in the log contains xxx or type is equal to log

#### 1.2.4 Download

Download logs stored in indexedDB

```ts
await logger.download({
    name, // optional name of the downloaded file defaults to timestamp
    filter, // optional same as filter in 1.2.3
    keys, // optional specifies additional properties to download
});
```

#### 1.2.5 Other APIs

##### 1.2.5.1 getAll

get all logs

```ts
await logger.getAll();
```

##### 1.2.5.1 get

Get a log based on the log id

```ts
await logger.getAll(logid);
```

##### 1.2.5.1 count

Get the number of logs

```ts
await logger.count();
```

##### 1.2.5.1 delete

Delete a log by log id

```ts
await logger.delete(logid);
```

##### 1.2.5.1 injectBaseInfo

Inject log basic information

```ts
await logger.injectBaseInfo({
    network: 'wifi',
    phone: 'xxxx',
});
```

##### 1.2.5.1 refreshTraceId

Refresh the traceid, generally used for reconnection, etc., considered to be the second visit scenario

Also refreshDurationStart

```ts
await logger.refreshTraceId();
```

##### 1.2.5.1 refreshDurationStart

Refresh the timing starting point, generally used in scenarios that need to re-count the time

```ts
await logger.refreshTraceId();
```

##### 1.2.5.1 close

close the database

```ts
await logger.close();
```

##### 1.2.5.1 clear

close and clear the database

```ts
await logger.clear();
```

##### 1.2.5.1 destory

Close, empty and delete the database

```ts
await logger.destory();
```
