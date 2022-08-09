<!--
 * @Author: tackchen
 * @Date: 2022-08-03 21:24:33
 * @Description: Coding something
-->
# [StringWorker](https://github.com/theajack/string-worker)

<p>
    <a href="https://www.github.com/theajack/string-worker/stargazers" target="_black">
        <img src="https://img.shields.io/github/stars/theajack/string-worker?logo=github" alt="stars" />
    </a>
    <a href="https://www.github.com/theajack/string-worker/network/members" target="_black">
        <img src="https://img.shields.io/github/forks/theajack/string-worker?logo=github" alt="forks" />
    </a>
    <a href="https://www.npmjs.com/package/string-worker" target="_black">
        <img src="https://img.shields.io/npm/v/string-worker?logo=npm" alt="version" />
    </a>
    <a href="https://www.npmjs.com/package/string-worker" target="_black">
        <img src="https://img.shields.io/npm/dm/string-worker?color=%23ffca28&logo=npm" alt="downloads" />
    </a>
    <a href="https://www.jsdelivr.com/package/npm/string-worker" target="_black">
        <img src="https://data.jsdelivr.com/v1/package/npm/string-worker/badge" alt="jsdelivr" />
    </a>
    <a href="https://github.com/theajack/string-worker/issues"><img src="https://img.shields.io/github/issues-closed/theajack/string-worker.svg" alt="issue"></a>
</p>
<p>
    <a href="https://github.com/theajack" target="_black">
        <img src="https://img.shields.io/badge/Author-%20theajack%20-7289da.svg?&logo=github" alt="author" />
    </a>
    <a href="https://www.github.com/theajack/string-worker/blob/master/LICENSE" target="_black">
        <img src="https://img.shields.io/github/license/theajack/string-worker?color=%232DCE89&logo=github" alt="license" />
    </a>
    <a href="https://cdn.jsdelivr.net/npm/string-worker/string-worker.min.js"><img src="https://img.shields.io/bundlephobia/minzip/string-worker.svg" alt="Size"></a>
    <a href="https://github.com/theajack/string-worker/search?l=javascript"><img src="https://img.shields.io/github/languages/top/theajack/string-worker.svg" alt="TopLang"></a>
    <a href="https://www.github.com/theajack/string-worker"><img src="https://img.shields.io/librariesio/dependent-repos/npm/string-worker.svg" alt="Dependent"></a>
    <a href="https://github.com/theajack/string-worker/blob/master/test/test-report.txt"><img src="https://img.shields.io/badge/test-passed-44BB44" alt="test"></a>
</p>

<h3>🚀 Makes creating WebWorkers easier</h3>

**[Online Use](https://shiyix.cn/jsbox?github=theajack.string-worker) | [中文](https://github.com/theajack/string-worker/blob/master/README.cn.md) | [Version Log](https://github.com/theajack/string-worker/blob/master/scripts/version.md) | [Feedback bug](https://github.com/theajack/string-worker/issues/new) | [Gitee](https://gitee.com/theajack/string-worker)**

## 0. Introduction

StringWorker is committed to helping developers access WebWorker at low cost. In webpack and rollup projects, js or ts modules are introduced as the internal code of the worker, and there is no need to maintain the internal code of the worker separately.

### 0.2 Features

1. Use the code string to initialize the worker without using a third-party url
2. Support Promise to get the message returned by the worker
3. Support webpack, rollup import loader use (under development...)

## 1. Quick use

### 1.0 install

#### 1.0.1 npm install

```
npm i string-worker
```

```js
import StringWorker from 'string-worker';
```

#### 1.0.2 cdn

```html
<script src="https://cdn.jsdelivr.net/npm/string-worker/string-worker.min.js"></script>
<script>
  window.StringWorker;
</script>
```

### 1.1 Initializing with strings

#### 1.1.1 Using raw data

````js
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
````

#### 1.1.2 Use promise to get worker's return value

````js
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
  id: `msg_${id++}`, // need to pass in a unique id to match the message
}).then(d => {
  console.log('Worker Return: ', d);
});
````

### 1.2. Using function initialization


#### 1.2.1 Using js

````js
const worker = new StringWorker({
  setup () { // not required
    return {msg: 'hello world'};
  },
  onmessage (message, data) { // The second parameter is the return value of setup
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.log(d);
});
````

#### 1.2.2 Use ts to pass in generics to declare types

When using ts references, generics can be passed in to standardize setup return values ​​and message types

```ts
const worker = new StringWorker<
  {msg: string}, // setup return value
  {send: string}, // type of send
  {receive: string} // return type
>({
  setup () { // not required
    return {msg: 'hello world'};
  },
  onmessage (message, data) { // The second parameter is the return value of setup
    return {receive: message.send + data.msg};
  }
});

worker.postMessage({send: 'Hello'}).then(d => {
  console.log(d);
});
````

## 2 Use string-worker-loader (in development...)

This part is currently under development. At present, developers can write an independent packaging module to package the worker code into a file, and then import the file as a StringWorker construction parameter to implement the loader function.

### 2.1 webpack-loader

### 2.2 rollup-loader

### 2.3 esbuild-loader