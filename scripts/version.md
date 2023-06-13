<!--
 * @Author: tackchen
 * @Date: 2022-08-07 15:17:42
 * @Description: Coding something
-->

## 0.0.5 doing

1. add log检查discard改为异步 提高性能
2. 增加 onError 事件

## 0.0.4

## 0.0.3

1. fix downdload 方法参数为空报错
   
## 0.0.2

1. downdload 增加 keys参数，可以选择额外属性下载

## 0.0.1

1. 支持 WebWorker + indexedDB 存储日志
2. 可选三种日志存储模式，且当不支持时会自动向下选择支持的模式
3. 支持不存储模式，只使用idb-logger作为日志生成工具
4. 支持定义最大存储日志数量，会自动删除最早的记录
5. 支持下载日志
6. 支持查询日志，支持多种查询模式
7. 支持自定义基础数据
8. 支持基于onReport回调自定义上报

