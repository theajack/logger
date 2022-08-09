<!--
 * @Author: tackchen
 * @Date: 2022-08-03 21:24:33
 * @Description: Coding something
-->

# [tc-logger](https://github.com/theajack/tc-logger)

<p>
    <a href="https://www.github.com/theajack/tc-logger/stargazers" target="_black">
        <img src="https://img.shields.io/github/stars/theajack/tc-logger?logo=github" alt="stars" />
    </a>
    <a href="https://www.github.com/theajack/tc-logger/network/members" target="_black">
        <img src="https://img.shields.io/github/forks/theajack/tc-logger?logo=github" alt="forks" />
    </a>
    <a href="https://www.npmjs.com/package/tc-logger" target="_black">
        <img src="https://img.shields.io/npm/v/tc-logger?logo=npm" alt="version" />
    </a>
    <a href="https://www.npmjs.com/package/tc-logger" target="_black">
        <img src="https://img.shields.io/npm/dm/tc-logger?color=%23ffca28&logo=npm" alt="downloads" />
    </a>
    <a href="https://www.jsdelivr.com/package/npm/tc-logger" target="_black">
        <img src="https://data.jsdelivr.com/v1/package/npm/tc-logger/badge" alt="jsdelivr" />
    </a>
    <a href="https://github.com/theajack/tc-logger/issues"><img src="https://img.shields.io/github/issues-closed/theajack/tc-logger.svg" alt="issue"></a>
</p>
<p>
    <a href="https://github.com/theajack" target="_black">
        <img src="https://img.shields.io/badge/Author-%20theajack%20-7289da.svg?&logo=github" alt="author" />
    </a>
    <a href="https://www.github.com/theajack/tc-logger/blob/master/LICENSE" target="_black">
        <img src="https://img.shields.io/github/license/theajack/tc-logger?color=%232DCE89&logo=github" alt="license" />
    </a>
    <a href="https://cdn.jsdelivr.net/npm/tc-logger/tc-logger.min.js"><img src="https://img.shields.io/bundlephobia/minzip/tc-logger.svg" alt="Size"></a>
    <a href="https://github.com/theajack/tc-logger/search?l=javascript"><img src="https://img.shields.io/github/languages/top/theajack/tc-logger.svg" alt="TopLang"></a>
    <a href="https://www.github.com/theajack/tc-logger"><img src="https://img.shields.io/librariesio/dependent-repos/npm/tc-logger.svg" alt="Dependent"></a>
    <a href="https://github.com/theajack/tc-logger/blob/master/test/test-report.txt"><img src="https://img.shields.io/badge/test-passed-44BB44" alt="test"></a>
</p>

<h3>🚀 基于 WebWorker 和 indexedDB 的高性能、高容量、高扩展的web端日志系统</h3>

**[在线使用](https://shiyix.cn/jsbox?github=theajack.tc-logger) | [English](https://github.com/theajack/tc-logger) | [更新日志](https://github.com/theajack/tc-logger/blob/master/scripts/version.md) | [问题反馈](https://github.com/theajack/tc-logger/issues/new) | [Gitee](https://gitee.com/theajack/tc-logger)**

## 0. 介绍

StringWorker 致力于帮助开发者低成本接入WebWorker，在webpack和rollup项目中，引入js或者ts模块作为worker内部代码，无需单独维护woker内部代码

### 0.2 特性

1. 支持 WebWorker + indexedDB 存储日志
2. 可选三种日志存储模式，且当不支持时会自动向下选择支持的模式
3. 支持不存储模式，只使用tc-logger作为日志生成工具
4. 支持定义最大存储日志数量，会自动删除最早的记录
5. 支持下载日志
6. 支持查询日志，支持多种查询模式
7. 支持自定义基础数据
8. 支持基于onReport回调自定义上报


## 1. 快速使用

### 1.0 install

#### 1.0.1 npm install

```
npm i tc-logger
```

```js
import StringWorker from 'tc-logger';
```

#### 1.0.2 cdn

```html
<script src="https://cdn.jsdelivr.net/npm/tc-logger/tc-logger.min.js"></script>
<script>
  window.StringWorker;
</script>
```

### 1.1 使用字符串初始化

#### 1.1.1 使用原始数据

```js
const worker = new StringWorker(/* javascript*/`
  globalThis.addEventListener('message', function (e) {
    var data = e.data;

    // do something...
    console.log('Worker Receive: ', data);

    globalThis.postMessage('Worker Send: '+data);
  }, false);
`);

worker.onMessage(data => {
  console.log(data);
});

worker.postMessage('Hello World');
```

#### 1.1.2 使用 promise 获取worker的返回值

```js
const worker = new StringWorker(/* javascript*/`
  globalThis.addEventListener('message', function (e) {
    var data = e.data;
    console.log('Worker Receive: ', data);

    // do something...
    var message = 'Worker Send: '+data.message;

    globalThis.postMessage({
      message: message,
      id: data.id
    });
  }, false);
`);

let id = 0;
worker.postMessage({
  message: 'Hello World',
  id: `msg_${id++}`, // 需要传入唯一id以匹配消息
}).then(d => {
  console.log('Worker Return: ', d);
});
```

### 1.2. 使用函数初始化


#### 1.2.1 使用js

```js
const worker = new StringWorker({
  setup () { // 非必须
    return {msg: 'hello world'};
  },
  onmessage (message, data) { // 第二个参数为 setup的返回值
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.log(d);
});
```

#### 1.2.2 使用ts传入泛型 声明类型

当使用ts引用时，可以传入泛型来规范 setup 返回值和 message类型

```ts
const worker = new StringWorker<
  {msg: string}, // setup返回值
  {send: string}, // 发送的类型
  {receive: string} // 返回的类型
>({
  setup () { // 非必须
    return {msg: 'hello world'};
  },
  onmessage (message, data) { // 第二个参数为 setup的返回值
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.log(d);
});
```

## 2 使用 tc-logger-loader （开发中...）

目前该部分正在开发中，目前开发者可自行编写一个独立的打包模块将 worker代码打包到一个文件中，然后引入该文件作为 StringWorker 构造参数实现loader功能

### 2.1 webpack-loader

### 2.2 rollup-loader

### 2.3 esbuild-loader