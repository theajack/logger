var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/common/utils.ts
function uuid() {
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++)
    s[i] = hexDigits.substr(Math.floor(Math.random() * 16), 1);
  s[14] = "4";
  s[19] = hexDigits.substr(s[19] & 3 | 8, 1);
  s[8] = "-";
  s[13] = "-";
  s[18] = "-";
  s[23] = "-";
  const uuid2 = s.join("");
  return uuid2;
}
function transformDOM(value) {
  const attributes = value.attributes;
  let attrs = "";
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    attrs += ` ${attr.name}="${attr.value}"`;
  }
  return `<${value.tagName.toLowerCase()}${attrs}/>`;
}
function toLogString(value) {
  if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return value.toString();
  }
}
function dateToStr(date, comm = ":") {
  const dateStr = `${date.getFullYear()}-${fn(date.getMonth() + 1)}-${fn(date.getDate())}`;
  const ms = date.getMilliseconds();
  const msStr = ms < 100 ? `0${fn(ms)}` : ms;
  return `${dateStr} ${fn(date.getHours())}${comm}${fn(date.getMinutes())}${comm}${fn(date.getSeconds())}${comm}${msStr}`;
}
function fn(num) {
  return num < 10 ? `0${num}` : num;
}
function codeToBlob(code) {
  const blob = new window.Blob([code], { type: "text/javascript" });
  const objectURL = window.URL.createObjectURL(blob);
  return objectURL;
}
var DefaultKeys = [
  "type",
  "msg",
  "payload",
  "uid",
  "traceid",
  "logid",
  "duration",
  "network",
  "url",
  "ua"
];
function dataToLogString(data, keys = []) {
  let content = `[${data.time}]`;
  const append = (key) => {
    const v = data[key];
    if (typeof v !== "undefined" && v !== "") {
      content += ` ${key}=${toLogString(v)};`;
    }
  };
  console.log(keys);
  for (const key of keys) {
    append(key);
  }
  for (const key of DefaultKeys) {
    if (!keys.includes(key)) {
      append(key);
    }
  }
  return content;
}
function download({
  name,
  content,
  type = "text/plain"
}) {
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("style", "position: fixed;top: -100px");
  document.body.appendChild(downloadLink);
  downloadLink.setAttribute("download", name);
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  downloadLink.href = url;
  downloadLink.click();
}
function isJson(data) {
  return typeof data === "object" && data.constructor.name === "Object";
}

// src/common/t-log.ts
var HEADER = "[TCLogger]:";
function logBase(args, type) {
  const first = args[0];
  if (typeof first === "string" || typeof first === "string") {
    args[0] = HEADER + first;
  } else {
    args.unshift(HEADER);
  }
  console[type](...args);
}
var TLog = {
  log(...args) {
    logBase(args, "log");
  },
  warn(...args) {
    logBase(args, "warn");
  },
  info(...args) {
    logBase(args, "info");
  },
  error(...args) {
    logBase(args, "error");
  }
};

// src/common/base-info.ts
var _BaseInfo = class {
  constructor({
    id,
    useConsole,
    maxRecords
  }) {
    this.data = {
      clientid: "",
      uid: "",
      traceid: "",
      network: "",
      url: "",
      ua: ""
    };
    this.config = {
      useConsole: true,
      maxRecords: -1
    };
    this.injectConfig({ useConsole, maxRecords });
    this.name = `${_BaseInfo.DEFAULT_DB_NAME_PREFIX}_${id}`;
    this.refreshTraceId();
  }
  refreshTraceId() {
    this.data.traceid = uuid();
    this.refreshDurationStart();
  }
  refreshDurationStart() {
    this.durationStart = Date.now();
  }
  injectBaseInfo(baseInfo) {
    Object.assign(this.data, baseInfo);
  }
  injectConfig(data) {
    Object.assign(this.config, data);
  }
  appendBaseInfo(data) {
    const date = new Date();
    const timestamp = date.getTime();
    const time = dateToStr(date);
    const duration = timestamp - this.durationStart;
    const extend = data.extend || {};
    delete data.extend;
    const result = Object.assign(data, this.data, {
      timestamp,
      time,
      logid: uuid(),
      duration
    }, extend);
    if (this.config.useConsole) {
      const str = dataToLogString(result);
      const fn2 = TLog[result.type] || console.log;
      fn2(str);
    }
    return result;
  }
};
var BaseInfo = _BaseInfo;
BaseInfo.DEFAULT_DB_NAME_PREFIX = "tc_logger";

// src/common/db-base.ts
var DBBaseMethods = class {
  constructor(data) {
    this.type = "idb";
  }
};
var DBBase = class extends DBBaseMethods {
  constructor(data) {
    super(data);
    this.baseInfo = new BaseInfo(data);
  }
  get name() {
    return this.baseInfo.name;
  }
  injectBaseInfo(data) {
    this.baseInfo.injectBaseInfo(data);
    return Promise.resolve();
  }
  refreshTraceId() {
    this.baseInfo.refreshTraceId();
    return Promise.resolve();
  }
  refreshDurationStart() {
    this.baseInfo.refreshDurationStart();
    return Promise.resolve();
  }
};

// src/worker/dist/worker.min.ts
var worker_min_default = `var module = {}; var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/worker/index.ts
var worker_exports = {};
__export(worker_exports, {
  default: () => worker_default
});
module.exports = __toCommonJS(worker_exports);

// src/common/t-log.ts
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.In order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
var HEADER = "[TCLogger]:";
function logBase(args, type) {
  var _console;
  var first = args[0];
  if (typeof first === "string" || typeof first === "string") {
    args[0] = HEADER + first;
  } else {
    args.unshift(HEADER);
  }
  (_console = console)[type].apply(_console, _toConsumableArray(args));
}
var TLog = {
  log: function log() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    logBase(args, "log");
  },
  warn: function warn() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    logBase(args, "warn");
  },
  info: function info() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    logBase(args, "info");
  },
  error: function error() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    logBase(args, "error");
  }
};

// src/common/utils.ts
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray2(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it)
        o = it;
      var i = 0;
      var F = function F2() {
      };
      return { s: F, n: function n() {
        if (i >= o.length)
          return { done: true };
        return { done: false, value: o[i++] };
      }, e: function e(_e) {
        throw _e;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.In order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return { s: function s() {
    it = it.call(o);
  }, n: function n() {
    var step = it.next();
    normalCompletion = step.done;
    return step;
  }, e: function e(_e2) {
    didErr = true;
    err = _e2;
  }, f: function f() {
    try {
      if (!normalCompletion && it.return != null)
        it.return();
    } finally {
      if (didErr)
        throw err;
    }
  } };
}
function _unsupportedIterableToArray2(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray2(o, minLen);
}
function _arrayLikeToArray2(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && typeof Symbol == "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof(obj);
}
function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 16), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr(s[19] & 3 | 8, 1);
  s[8] = "-";
  s[13] = "-";
  s[18] = "-";
  s[23] = "-";
  var uuid2 = s.join("");
  return uuid2;
}
function toLogString(value) {
  if (_typeof(value) === "object") {
    return JSON.stringify(value);
  } else {
    return value.toString();
  }
}
function dateToStr(date) {
  var comm = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : ":";
  var dateStr = "".concat(date.getFullYear(), "-").concat(fn(date.getMonth() + 1), "-").concat(fn(date.getDate()));
  var ms = date.getMilliseconds();
  var msStr = ms < 100 ? "0".concat(fn(ms)) : ms;
  return "".concat(dateStr, " ").concat(fn(date.getHours())).concat(comm).concat(fn(date.getMinutes())).concat(comm).concat(fn(date.getSeconds())).concat(comm).concat(msStr);
}
function fn(num) {
  return num < 10 ? "0".concat(num) : num;
}
var DefaultKeys = ["type", "msg", "payload", "uid", "traceid", "logid", "duration", "network", "url", "ua"];
function dataToLogString(data) {
  var keys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
  var content = "[".concat(data.time, "]");
  var append = function append2(key2) {
    var v = data[key2];
    if (typeof v !== "undefined" && v !== "") {
      content += " ".concat(key2, "=").concat(toLogString(v), ";");
    }
  };
  console.log(keys);
  var _iterator = _createForOfIteratorHelper(keys), _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var key = _step.value;
      append(key);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var _iterator2 = _createForOfIteratorHelper(DefaultKeys), _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
      var _key = _step2.value;
      if (!keys.includes(_key)) {
        append(_key);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return content;
}

// src/common/base-info.ts
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var BaseInfo = /* @__PURE__ */ function() {
  function BaseInfo2(_ref) {
    var id = _ref.id, useConsole = _ref.useConsole, maxRecords = _ref.maxRecords;
    _classCallCheck(this, BaseInfo2);
    _defineProperty(this, "data", {
      clientid: "",
      uid: "",
      traceid: "",
      network: "",
      url: "",
      ua: ""
    });
    _defineProperty(this, "config", {
      useConsole: true,
      maxRecords: -1
    });
    this.injectConfig({
      useConsole,
      maxRecords
    });
    this.name = "".concat(BaseInfo2.DEFAULT_DB_NAME_PREFIX, "_").concat(id);
    this.refreshTraceId();
  }
  _createClass(BaseInfo2, [{
    key: "refreshTraceId",
    value: function refreshTraceId() {
      this.data.traceid = uuid();
      this.refreshDurationStart();
    }
  }, {
    key: "refreshDurationStart",
    value: function refreshDurationStart() {
      this.durationStart = Date.now();
    }
  }, {
    key: "injectBaseInfo",
    value: function injectBaseInfo(baseInfo) {
      Object.assign(this.data, baseInfo);
    }
  }, {
    key: "injectConfig",
    value: function injectConfig(data) {
      Object.assign(this.config, data);
    }
  }, {
    key: "appendBaseInfo",
    value: function appendBaseInfo(data) {
      var date = new Date();
      var timestamp = date.getTime();
      var time = dateToStr(date);
      var duration = timestamp - this.durationStart;
      var extend = data.extend || {};
      delete data.extend;
      var result = Object.assign(data, this.data, {
        timestamp,
        time,
        logid: uuid(),
        duration
      }, extend);
      if (this.config.useConsole) {
        var str = dataToLogString(result);
        var fn2 = TLog[result.type] || console.log;
        fn2(str);
      }
      return result;
    }
  }]);
  return BaseInfo2;
}();
_defineProperty(BaseInfo, "DEFAULT_DB_NAME_PREFIX", "tc_logger");

// src/common/db-base.ts
function _typeof2(obj) {
  "@babel/helpers - typeof";
  return _typeof2 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && typeof Symbol == "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof2(obj);
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass)
    _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf3(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof2(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct)
    return false;
  if (Reflect.construct.sham)
    return false;
  if (typeof Proxy === "function")
    return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf3(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf(o);
}
function _defineProperties2(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass2(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties2(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties2(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _classCallCheck2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var DBBaseMethods = /* @__PURE__ */ _createClass2(function DBBaseMethods2(data) {
  _classCallCheck2(this, DBBaseMethods2);
  this.type = "idb";
});
var DBBase = /* @__PURE__ */ function(_DBBaseMethods) {
  _inherits(DBBase2, _DBBaseMethods);
  var _super = _createSuper(DBBase2);
  function DBBase2(data) {
    var _this;
    _classCallCheck2(this, DBBase2);
    _this = _super.call(this, data);
    _this.baseInfo = new BaseInfo(data);
    return _this;
  }
  _createClass2(DBBase2, [{
    key: "name",
    get: function get() {
      return this.baseInfo.name;
    }
  }, {
    key: "injectBaseInfo",
    value: function injectBaseInfo(data) {
      this.baseInfo.injectBaseInfo(data);
      return Promise.resolve();
    }
  }, {
    key: "refreshTraceId",
    value: function refreshTraceId() {
      this.baseInfo.refreshTraceId();
      return Promise.resolve();
    }
  }, {
    key: "refreshDurationStart",
    value: function refreshDurationStart() {
      this.baseInfo.refreshDurationStart();
      return Promise.resolve();
    }
  }]);
  return DBBase2;
}(DBBaseMethods);

// src/filter-json/filter.ts
function _typeof3(obj) {
  "@babel/helpers - typeof";
  return _typeof3 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && typeof Symbol == "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof3(obj);
}
function checkValue(value, condition) {
  if (typeof condition === "function") {
    return condition(value);
  } else if (_typeof3(value) === "object") {
    if (value.constructor.name === "Object") {
      if (condition instanceof Array) {
        for (var i = 0; i < condition.length; i++) {
          var filter = condition[i];
          if (checkValue(value, filter))
            return true;
        }
        return false;
      } else {
        for (var k in condition) {
          var val = value[k];
          var _filter = condition[k];
          if (!checkValue(val, _filter))
            return false;
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

// src/filter-json/func-filter.ts
var FuncFilter = function() {
  var PREFIX = "/*fn*/";
  return {
    transFunc: function transFunc(filter) {
      if (typeof filter === "function") {
        return "/*fn*/" + filter.toString();
      }
      return filter;
    },
    transBack: function transBack(filter) {
      if (typeof filter === "string") {
        return new Function("return (".concat(filter, ")"))();
      }
      return filter;
    },
    isFuncString: function isFuncString(str) {
      return str.indexOf(PREFIX) === 0;
    }
  };
}();

// src/worker/store.ts
function _typeof4(obj) {
  "@babel/helpers - typeof";
  return _typeof4 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && typeof Symbol == "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof4(obj);
}
function _regeneratorRuntime() {
  "use strict";
  _regeneratorRuntime = function _regeneratorRuntime3() {
    return exports;
  };
  var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = typeof Symbol == "function" ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function define2(obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []);
    return generator._invoke = function(innerFn2, self2, context2) {
      var state = "suspendedStart";
      return function(method, arg) {
        if (state === "executing")
          throw new Error("Generator is already running");
        if (state === "completed") {
          if (method === "throw")
            throw arg;
          return doneResult();
        }
        for (context2.method = method, context2.arg = arg; ; ) {
          var delegate = context2.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context2);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel)
                continue;
              return delegateResult;
            }
          }
          if (context2.method === "next")
            context2.sent = context2._sent = context2.arg;
          else if (context2.method === "throw") {
            if (state === "suspendedStart")
              throw state = "completed", context2.arg;
            context2.dispatchException(context2.arg);
          } else
            context2.method === "return" && context2.abrupt("return", context2.arg);
          state = "executing";
          var record = tryCatch(innerFn2, self2, context2);
          if (record.type === "normal") {
            if (state = context2.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel)
              continue;
            return { value: record.arg, done: context2.done };
          }
          record.type === "throw" && (state = "completed", context2.method = "throw", context2.arg = record.arg);
        }
      };
    }(innerFn, self, context), generator;
  }
  function tryCatch(fn2, obj, arg) {
    try {
      return { type: "normal", arg: fn2.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function() {
    return this;
  });
  var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type !== "throw") {
        var result = record.arg, value = result.value;
        return value && _typeof4(value) == "object" && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function(value2) {
          invoke("next", value2, resolve, reject);
        }, function(err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function(unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function(error2) {
          return invoke("throw", error2, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    this._invoke = function(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }
      return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === void 0) {
      if (context.delegate = null, context.method === "throw") {
        if (delegate.iterator.return && (context.method = "return", context.arg = void 0, maybeInvokeDelegate(delegate, context), context.method === "throw"))
          return ContinueSentinel;
        context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }
      return ContinueSentinel;
    }
    var record = tryCatch(method, delegate.iterator, context.arg);
    if (record.type === "throw")
      return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info2 = record.arg;
    return info2 ? info2.done ? (context[delegate.resultName] = info2.value, context.next = delegate.nextLoc, context.method !== "return" && (context.method = "next", context.arg = void 0), context.delegate = null, ContinueSentinel) : info2 : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(true);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod)
        return iteratorMethod.call(iterable);
      if (typeof iterable.next == "function")
        return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1, next = function next2() {
          for (; ++i < iterable.length; ) {
            if (hasOwn.call(iterable, i))
              return next2.value = iterable[i], next2.done = false, next2;
          }
          return next2.value = void 0, next2.done = true, next2;
        };
        return next.next = next;
      }
    }
    return { next: doneResult };
  }
  function doneResult() {
    return { value: void 0, done: true };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun == "function" && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || (ctor.displayName || ctor.name) === "GeneratorFunction");
  }, exports.mark = function(genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function(arg) {
    return { __await: arg };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    PromiseImpl === void 0 && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function() {
    return this;
  }), define(Gp, "toString", function() {
    return "[object Generator]";
  }), exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    return keys.reverse(), function next() {
      for (; keys.length; ) {
        var key2 = keys.pop();
        if (key2 in object)
          return next.value = key2, next.done = false, next;
      }
      return next.done = true, next;
    };
  }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) {
    if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = false, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(resetTryEntry), !skipTempReset)
      for (var name in this) {
        name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = void 0);
      }
  }, stop: function stop() {
    this.done = true;
    var rootRecord = this.tryEntries[0].completion;
    if (rootRecord.type === "throw")
      throw rootRecord.arg;
    return this.rval;
  }, dispatchException: function dispatchException(exception) {
    if (this.done)
      throw exception;
    var context = this;
    function handle(loc, caught) {
      return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = void 0), !!caught;
    }
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i], record = entry.completion;
      if (entry.tryLoc === "root")
        return handle("end");
      if (entry.tryLoc <= this.prev) {
        var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc");
        if (hasCatch && hasFinally) {
          if (this.prev < entry.catchLoc)
            return handle(entry.catchLoc, true);
          if (this.prev < entry.finallyLoc)
            return handle(entry.finallyLoc);
        } else if (hasCatch) {
          if (this.prev < entry.catchLoc)
            return handle(entry.catchLoc, true);
        } else {
          if (!hasFinally)
            throw new Error("try statement without catch or finally");
          if (this.prev < entry.finallyLoc)
            return handle(entry.finallyLoc);
        }
      }
    }
  }, abrupt: function abrupt(type, arg) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
        var finallyEntry = entry;
        break;
      }
    }
    finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
    var record = finallyEntry ? finallyEntry.completion : {};
    return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
  }, complete: function complete(record, afterLoc) {
    if (record.type === "throw")
      throw record.arg;
    return record.type === "break" || record.type === "continue" ? this.next = record.arg : record.type === "return" ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : record.type === "normal" && afterLoc && (this.next = afterLoc), ContinueSentinel;
  }, finish: function finish(finallyLoc) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.finallyLoc === finallyLoc)
        return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
    }
  }, catch: function _catch(tryLoc) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.tryLoc === tryLoc) {
        var record = entry.completion;
        if (record.type === "throw") {
          var thrown = record.arg;
          resetTryEntry(entry);
        }
        return thrown;
      }
    }
    throw new Error("illegal catch attempt");
  }, delegateYield: function delegateYield(iterable, resultName, nextLoc) {
    return this.delegate = { iterator: values(iterable), resultName, nextLoc }, this.method === "next" && (this.arg = void 0), ContinueSentinel;
  } }, exports;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info2 = gen[key](arg);
    var value = info2.value;
  } catch (error2) {
    reject(error2);
    return;
  }
  if (info2.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn2) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn2.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
function _classCallCheck3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties3(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass3(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties3(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties3(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _inherits2(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass)
    _setPrototypeOf2(subClass, superClass);
}
function _setPrototypeOf2(o, p) {
  _setPrototypeOf2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf3(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf2(o, p);
}
function _createSuper2(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct2();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf2(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf2(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn2(this, result);
  };
}
function _possibleConstructorReturn2(self, call) {
  if (call && (_typeof4(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized2(self);
}
function _assertThisInitialized2(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct2() {
  if (typeof Reflect === "undefined" || !Reflect.construct)
    return false;
  if (Reflect.construct.sham)
    return false;
  if (typeof Proxy === "function")
    return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _getPrototypeOf2(o) {
  _getPrototypeOf2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf3(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf2(o);
}
function _defineProperty2(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var INDEX_NAME = "logid";
var dbMap = {};
function createMessageMap(db) {
  return {
    add: function add(data) {
      return db.add(data);
    },
    injectConfig: function injectConfig(data) {
      return db.baseInfo.injectConfig(data);
    },
    closeDB: function closeDB() {
      return db.close();
    },
    destory: function destory() {
      return db.destory();
    },
    refreshTraceId: function refreshTraceId() {
      return db.refreshTraceId();
    },
    injectBaseInfo: function injectBaseInfo(data) {
      return db.baseInfo.injectBaseInfo(data);
    },
    get: function get(msgid) {
      return db.get(msgid);
    },
    getAll: function getAll() {
      return db.getAll();
    },
    refreshDurationStart: function refreshDurationStart() {
      return db.refreshDurationStart();
    },
    filter: function filter(_filter) {
      return db.filter(_filter);
    },
    download: function download(data) {
      return db.download(data);
    },
    count: function count() {
      return db.count();
    },
    delete: function _delete(msgid) {
      return db.delete(msgid);
    },
    clear: function clear() {
      return db.clear();
    }
  };
}
var WorkerDB = /* @__PURE__ */ function(_DBBase) {
  _inherits2(WorkerDB2, _DBBase);
  var _super = _createSuper2(WorkerDB2);
  function WorkerDB2() {
    var _this;
    var id = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "default";
    _classCallCheck3(this, WorkerDB2);
    _this = _super.call(this, {
      id,
      useConsole: true,
      maxRecords: 0
    });
    _defineProperty2(_assertThisInitialized2(_this), "STORE_NAME", "records");
    _defineProperty2(_assertThisInitialized2(_this), "loadCallbacks", []);
    if (dbMap[_this.name])
      return _possibleConstructorReturn2(_this, dbMap[_this.name]);
    if (!_this.db) {
      _this._initDB();
    }
    dbMap[_this.name] = _assertThisInitialized2(_this);
    _this.msgMap = createMessageMap(_assertThisInitialized2(_this));
    return _this;
  }
  _createClass3(WorkerDB2, [{
    key: "add",
    value: function add(data) {
      var _this2 = this;
      return new Promise(/* @__PURE__ */ function() {
        var _ref = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee2(resolve) {
          var dbData;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (data) {
                    _context2.next = 3;
                    break;
                  }
                  TLog.warn("add: data is required");
                  return _context2.abrupt("return", null);
                case 3:
                  dbData = _this2.baseInfo.appendBaseInfo(data);
                  if (_this2.db) {
                    _context2.next = 8;
                    break;
                  }
                  _this2.loadCallbacks.push(/* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee() {
                    return _regeneratorRuntime().wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.t0 = resolve;
                            _context.next = 3;
                            return _this2._addDBData(dbData);
                          case 3:
                            _context.t1 = _context.sent;
                            (0, _context.t0)(_context.t1);
                          case 5:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  })));
                  _context2.next = 13;
                  break;
                case 8:
                  _context2.t0 = resolve;
                  _context2.next = 11;
                  return _this2._addDBData(dbData);
                case 11:
                  _context2.t1 = _context2.sent;
                  (0, _context2.t0)(_context2.t1);
                case 13:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));
        return function(_x) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "_addDBData",
    value: function _addDBData(dbData) {
      var _this3 = this;
      return new Promise(/* @__PURE__ */ function() {
        var _ref3 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee4(resolve) {
          var request;
          return _regeneratorRuntime().wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  request = _this3._getStore("readwrite").add(dbData);
                  request.onsuccess = /* @__PURE__ */ _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee3() {
                    var n, discard;
                    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.next = 2;
                            return _this3.count();
                          case 2:
                            n = _context3.sent;
                            discard = null;
                            if (!(n > _this3.baseInfo.config.maxRecords)) {
                              _context3.next = 8;
                              break;
                            }
                            _context3.next = 7;
                            return _this3._removeFirst();
                          case 7:
                            discard = _context3.sent;
                          case 8:
                            resolve({
                              discard,
                              add: dbData
                            });
                          case 9:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3);
                  }));
                  request.onerror = function(event) {
                    TLog.error("\u6570\u636E\u5199\u5165\u5931\u8D25", event);
                    resolve(null);
                  };
                case 3:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));
        return function(_x2) {
          return _ref3.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "_getStore",
    value: function _getStore() {
      var mode = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "readonly";
      return this.db.transaction([this.STORE_NAME], mode).objectStore(this.STORE_NAME);
    }
  }, {
    key: "clear",
    value: function clear() {
      var _this4 = this;
      return new Promise(function(resolve) {
        var objectStore = _this4._getStore("readwrite");
        var request = objectStore.clear();
        request.onsuccess = function() {
          TLog.log("\u6E05\u9664\u6570\u636E\u6210\u529F");
          resolve(true);
        };
        request.onerror = function() {
          TLog.warn("\u6E05\u9664\u6570\u636E\u6210\u529F");
          resolve(false);
        };
      });
    }
  }, {
    key: "close",
    value: function close() {
      this.db.close();
      this.db = void 0;
      delete dbMap[this.name];
      return Promise.resolve(true);
    }
  }, {
    key: "destory",
    value: function destory() {
      var _this5 = this;
      return new Promise(function(resolve) {
        _this5.close();
        var request = globalThis.indexedDB.deleteDatabase(_this5.baseInfo.name);
        request.onsuccess = function() {
          TLog.info("\u6570\u636E\u5E93\u5DF2\u9500\u6BC1");
          resolve(true);
        };
        request.onerror = function(event) {
          TLog.warn("\u6570\u636E\u5E93\u9500\u6BC1\u5931\u8D25:", event);
          resolve(false);
        };
      });
    }
  }, {
    key: "get",
    value: function get(logid) {
      var _this6 = this;
      return new Promise(function(resolve) {
        var request = _this6._getStore("readonly").index(INDEX_NAME).get(logid);
        request.onerror = function() {
          TLog.error("\u6570\u636E\u67E5\u8BE2\u5931\u8D25", logid);
          resolve(null);
        };
        request.onsuccess = function() {
          if (request.result) {
            resolve(request.result);
          } else {
            TLog.warn("\u672A\u67E5\u8BE2\u5230\u8BB0\u5F55", logid);
            resolve(null);
          }
        };
      });
    }
  }, {
    key: "getAll",
    value: function getAll() {
      var _this7 = this;
      return new Promise(function(resolve) {
        var result = [];
        _this7._cursorBase({
          onvalue: function onvalue(value) {
            result.push(value);
          },
          onend: function onend() {
            resolve(result);
          },
          onerror: function onerror() {
            resolve([]);
          }
        });
      });
    }
  }, {
    key: "download",
    value: function download(_ref5) {
      var _this8 = this;
      var filter = _ref5.filter, _ref5$keys = _ref5.keys, keys = _ref5$keys === void 0 ? [] : _ref5$keys;
      filter = FuncFilter.transBack(filter);
      return new Promise(function(resolve) {
        var content = "";
        var count = 0;
        _this8._cursorBase({
          onvalue: function onvalue(value) {
            if (checkValue(value, filter)) {
              count++;
              content += "".concat(dataToLogString(value, keys), "\\n");
            }
          },
          onend: function onend() {
            resolve({
              content,
              count
            });
          },
          onerror: function onerror() {
            resolve({
              content,
              count
            });
          }
        });
      });
    }
  }, {
    key: "filter",
    value: function filter(_filter2) {
      var _this9 = this;
      _filter2 = FuncFilter.transBack(_filter2);
      return new Promise(function(resolve) {
        var result = [];
        _this9._cursorBase({
          onvalue: function onvalue(value) {
            if (checkValue(value, _filter2)) {
              result.push(value);
            }
          },
          onend: function onend() {
            resolve(result);
          },
          onerror: function onerror() {
            resolve([]);
          }
        });
      });
    }
  }, {
    key: "count",
    value: function count() {
      var _this10 = this;
      return new Promise(function(resolve) {
        var objectStore = _this10._getStore();
        var index = objectStore.index(INDEX_NAME);
        var countRequest = index.count();
        countRequest.onsuccess = function() {
          resolve(countRequest.result);
        };
        countRequest.onerror = function() {
          resolve(-1);
        };
      });
    }
  }, {
    key: "_getKey",
    value: function _getKey(logid) {
      var _this11 = this;
      return new Promise(/* @__PURE__ */ function() {
        var _ref6 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee5(resolve) {
          var objectStore, request;
          return _regeneratorRuntime().wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  objectStore = _this11._getStore("readonly");
                  request = objectStore.index(INDEX_NAME).getKey(logid);
                  request.onsuccess = function(event) {
                    var _event$target;
                    resolve((event === null || event === void 0 ? void 0 : (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.result) || -1);
                  };
                  request.onerror = function(event) {
                    TLog.warn("getKey error", event);
                    resolve(-1);
                  };
                case 4:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));
        return function(_x3) {
          return _ref6.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "delete",
    value: function _delete(logid) {
      var _this12 = this;
      return new Promise(/* @__PURE__ */ function() {
        var _ref7 = _asyncToGenerator(/* @__PURE__ */ _regeneratorRuntime().mark(function _callee6(resolve) {
          var key, objectStore, request;
          return _regeneratorRuntime().wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.next = 2;
                  return _this12._getKey(logid);
                case 2:
                  key = _context6.sent;
                  if (!(key === -1)) {
                    _context6.next = 7;
                    break;
                  }
                  TLog.warn("\u5220\u9664\u5931\u8D25, \u8BB0\u5F55\u4E0D\u5B58\u5728\uFF1A", logid);
                  resolve(false);
                  return _context6.abrupt("return");
                case 7:
                  objectStore = _this12._getStore("readwrite");
                  request = objectStore.delete(key);
                  request.onsuccess = function() {
                    resolve(true);
                  };
                  request.onerror = function(event) {
                    resolve(false);
                    TLog.warn("\u5220\u9664\u65E5\u5FD7\u5931\u8D25", event);
                  };
                case 11:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
        }));
        return function(_x4) {
          return _ref7.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "_removeFirst",
    value: function _removeFirst() {
      var _this13 = this;
      return new Promise(function(resolve) {
        var objectStore = _this13._getStore("readwrite");
        var cursorObject = objectStore.openCursor();
        cursorObject.onsuccess = function(event) {
          var cursor = (event === null || event === void 0 ? void 0 : event.target).result;
          if (cursor) {
            cursor.delete();
            resolve(cursor.value);
          } else {
            resolve(null);
            TLog.warn("\u79FB\u9664\u6700\u65E9\u8BB0\u5F55\u5931\u8D25, cursor = null", event);
          }
        };
        cursorObject.onerror = function(event) {
          TLog.warn("\u79FB\u9664\u6700\u65E9\u8BB0\u5F55\u5931\u8D25", event);
          resolve(null);
        };
      });
    }
  }, {
    key: "_cursorBase",
    value: function _cursorBase(_ref8) {
      var onend = _ref8.onend, onvalue = _ref8.onvalue, onerror = _ref8.onerror;
      var objectStore = this._getStore();
      var cursorObject = objectStore.openCursor();
      cursorObject.onsuccess = function(event) {
        var cursor = (event === null || event === void 0 ? void 0 : event.target).result;
        if (cursor) {
          onvalue(cursor.value);
          cursor.continue();
        } else {
          onend();
        }
      };
      cursorObject.onerror = function() {
        TLog.error("\u67E5\u8BE2\u5931\u8D25");
        onerror();
      };
    }
  }, {
    key: "_initDB",
    value: function _initDB() {
      var _this14 = this;
      var request = globalThis.indexedDB.open(this.name, 1);
      request.onerror = function(event) {
        TLog.error("\u6570\u636E\u5E93\u6253\u5F00\u5931\u8D25", event);
      };
      request.onsuccess = function() {
        _this14.db = request.result;
        _this14.loadCallbacks.forEach(function(fn2) {
          return fn2();
        });
      };
      request.onupgradeneeded = function(event) {
        var _event$target2;
        var db = (_event$target2 = event.target) === null || _event$target2 === void 0 ? void 0 : _event$target2.result;
        _this14._checkCreateStore(db, _this14.STORE_NAME);
      };
    }
  }, {
    key: "_checkCreateStore",
    value: function _checkCreateStore(db, id) {
      if (!db.objectStoreNames.contains(id)) {
        var store = db.createObjectStore(id, {
          autoIncrement: true
        });
        store.createIndex(INDEX_NAME, INDEX_NAME, {
          unique: true
        });
      }
    }
  }]);
  return WorkerDB2;
}(DBBase);

// src/worker/index.ts
function _typeof5(obj) {
  "@babel/helpers - typeof";
  return _typeof5 = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && typeof Symbol == "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof5(obj);
}
function _regeneratorRuntime2() {
  "use strict";
  _regeneratorRuntime2 = function _regeneratorRuntime3() {
    return exports;
  };
  var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = typeof Symbol == "function" ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function define2(obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []);
    return generator._invoke = function(innerFn2, self2, context2) {
      var state = "suspendedStart";
      return function(method, arg) {
        if (state === "executing")
          throw new Error("Generator is already running");
        if (state === "completed") {
          if (method === "throw")
            throw arg;
          return doneResult();
        }
        for (context2.method = method, context2.arg = arg; ; ) {
          var delegate = context2.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context2);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel)
                continue;
              return delegateResult;
            }
          }
          if (context2.method === "next")
            context2.sent = context2._sent = context2.arg;
          else if (context2.method === "throw") {
            if (state === "suspendedStart")
              throw state = "completed", context2.arg;
            context2.dispatchException(context2.arg);
          } else
            context2.method === "return" && context2.abrupt("return", context2.arg);
          state = "executing";
          var record = tryCatch(innerFn2, self2, context2);
          if (record.type === "normal") {
            if (state = context2.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel)
              continue;
            return { value: record.arg, done: context2.done };
          }
          record.type === "throw" && (state = "completed", context2.method = "throw", context2.arg = record.arg);
        }
      };
    }(innerFn, self, context), generator;
  }
  function tryCatch(fn2, obj, arg) {
    try {
      return { type: "normal", arg: fn2.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function() {
    return this;
  });
  var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type !== "throw") {
        var result = record.arg, value = result.value;
        return value && _typeof5(value) == "object" && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function(value2) {
          invoke("next", value2, resolve, reject);
        }, function(err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function(unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function(error2) {
          return invoke("throw", error2, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    this._invoke = function(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }
      return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === void 0) {
      if (context.delegate = null, context.method === "throw") {
        if (delegate.iterator.return && (context.method = "return", context.arg = void 0, maybeInvokeDelegate(delegate, context), context.method === "throw"))
          return ContinueSentinel;
        context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }
      return ContinueSentinel;
    }
    var record = tryCatch(method, delegate.iterator, context.arg);
    if (record.type === "throw")
      return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info2 = record.arg;
    return info2 ? info2.done ? (context[delegate.resultName] = info2.value, context.next = delegate.nextLoc, context.method !== "return" && (context.method = "next", context.arg = void 0), context.delegate = null, ContinueSentinel) : info2 : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(true);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod)
        return iteratorMethod.call(iterable);
      if (typeof iterable.next == "function")
        return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1, next = function next2() {
          for (; ++i < iterable.length; ) {
            if (hasOwn.call(iterable, i))
              return next2.value = iterable[i], next2.done = false, next2;
          }
          return next2.value = void 0, next2.done = true, next2;
        };
        return next.next = next;
      }
    }
    return { next: doneResult };
  }
  function doneResult() {
    return { value: void 0, done: true };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun == "function" && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || (ctor.displayName || ctor.name) === "GeneratorFunction");
  }, exports.mark = function(genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function(arg) {
    return { __await: arg };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    PromiseImpl === void 0 && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function() {
    return this;
  }), define(Gp, "toString", function() {
    return "[object Generator]";
  }), exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    return keys.reverse(), function next() {
      for (; keys.length; ) {
        var key2 = keys.pop();
        if (key2 in object)
          return next.value = key2, next.done = false, next;
      }
      return next.done = true, next;
    };
  }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) {
    if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = false, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(resetTryEntry), !skipTempReset)
      for (var name in this) {
        name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = void 0);
      }
  }, stop: function stop() {
    this.done = true;
    var rootRecord = this.tryEntries[0].completion;
    if (rootRecord.type === "throw")
      throw rootRecord.arg;
    return this.rval;
  }, dispatchException: function dispatchException(exception) {
    if (this.done)
      throw exception;
    var context = this;
    function handle(loc, caught) {
      return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = void 0), !!caught;
    }
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i], record = entry.completion;
      if (entry.tryLoc === "root")
        return handle("end");
      if (entry.tryLoc <= this.prev) {
        var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc");
        if (hasCatch && hasFinally) {
          if (this.prev < entry.catchLoc)
            return handle(entry.catchLoc, true);
          if (this.prev < entry.finallyLoc)
            return handle(entry.finallyLoc);
        } else if (hasCatch) {
          if (this.prev < entry.catchLoc)
            return handle(entry.catchLoc, true);
        } else {
          if (!hasFinally)
            throw new Error("try statement without catch or finally");
          if (this.prev < entry.finallyLoc)
            return handle(entry.finallyLoc);
        }
      }
    }
  }, abrupt: function abrupt(type, arg) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
        var finallyEntry = entry;
        break;
      }
    }
    finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
    var record = finallyEntry ? finallyEntry.completion : {};
    return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
  }, complete: function complete(record, afterLoc) {
    if (record.type === "throw")
      throw record.arg;
    return record.type === "break" || record.type === "continue" ? this.next = record.arg : record.type === "return" ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : record.type === "normal" && afterLoc && (this.next = afterLoc), ContinueSentinel;
  }, finish: function finish(finallyLoc) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.finallyLoc === finallyLoc)
        return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
    }
  }, catch: function _catch(tryLoc) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.tryLoc === tryLoc) {
        var record = entry.completion;
        if (record.type === "throw") {
          var thrown = record.arg;
          resetTryEntry(entry);
        }
        return thrown;
      }
    }
    throw new Error("illegal catch attempt");
  }, delegateYield: function delegateYield(iterable, resultName, nextLoc) {
    return this.delegate = { iterator: values(iterable), resultName, nextLoc }, this.method === "next" && (this.arg = void 0), ContinueSentinel;
  } }, exports;
}
function asyncGeneratorStep2(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info2 = gen[key](arg);
    var value = info2.value;
  } catch (error2) {
    reject(error2);
    return;
  }
  if (info2.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator2(fn2) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn2.apply(self, args);
      function _next(value) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
function main() {
  globalThis.addEventListener("message", /* @__PURE__ */ function() {
    var _ref = _asyncToGenerator2(/* @__PURE__ */ _regeneratorRuntime2().mark(function _callee(e) {
      var _e$data, msgid, type, data, id, db, result;
      return _regeneratorRuntime2().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _e$data = e.data, msgid = _e$data.msgid, type = _e$data.type, data = _e$data.data, id = _e$data.id;
              db = new WorkerDB(id);
              result = db.msgMap[type](data);
              if (!(result instanceof Promise)) {
                _context.next = 7;
                break;
              }
              _context.next = 6;
              return result;
            case 6:
              result = _context.sent;
            case 7:
              globalThis.postMessage({
                msgid,
                id,
                type,
                result
              });
            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return function(_x) {
      return _ref.apply(this, arguments);
    };
  }(), false);
}
main();
var worker_default = "1";
/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
`;

// src/filter-json/func-filter.ts
var FuncFilter = (() => {
  const PREFIX = "/*fn*/";
  return {
    transFunc(filter) {
      if (typeof filter === "function") {
        return "/*fn*/" + filter.toString();
      }
      return filter;
    },
    transBack(filter) {
      if (typeof filter === "string") {
        return new Function(`return (${filter})`)();
      }
      return filter;
    },
    isFuncString(str) {
      return str.indexOf(PREFIX) === 0;
    }
  };
})();

// src/store/worker-store.ts
var msgid = 0;
var worker;
if (window.Worker) {
  worker = new window.Worker(codeToBlob(worker_min_default));
}
var WorkerStore = class extends DBBaseMethods {
  constructor({
    id,
    useConsole,
    maxRecords,
    onReport,
    onDiscard
  }) {
    super({
      id,
      useConsole,
      maxRecords
    });
    this.resolveMap = {};
    this.onDiscard = onDiscard;
    this.onReport = onReport;
    this.id = id;
    if (!worker) {
      worker = new window.Worker(codeToBlob(worker_min_default));
    }
    worker.onmessage = ({ data }) => {
      if (data.id === id) {
        this._onMessage(data);
      }
    };
    this._postMessage("injectConfig", {
      useConsole,
      maxRecords
    });
  }
  _onMessage(data) {
    if (data.type === "add") {
      const result = data.result;
      if (result) {
        if (result.__type === "discard") {
          if (this.onReport)
            this.onReport(result == null ? void 0 : result.add);
          if (this.onDiscard)
            this.onDiscard(result == null ? void 0 : result.discard);
        } else {
          if (this.onReport) {
            this.onReport(result);
          }
        }
      }
    }
    const resolve = this.resolveMap[data.msgid];
    if (resolve) {
      resolve(data);
      delete this.resolveMap[data.msgid];
    }
  }
  injectBaseInfo(baseInfo) {
    return this._postMessage("injectBaseInfo", baseInfo);
  }
  add(data) {
    return __async(this, null, function* () {
      return (yield this._postMessage("add", this._transformPayload(data))).result;
    });
  }
  close() {
    return this._postMessage("closeDB");
  }
  destory() {
    return this._postMessage("destory");
  }
  count() {
    return __async(this, null, function* () {
      return (yield this._postMessage("count")).result;
    });
  }
  clear() {
    return this._postMessage("clear");
  }
  delete(logid) {
    return this._postMessage("delete", logid);
  }
  refreshTraceId() {
    return this._postMessage("refreshTraceId");
  }
  refreshDurationStart() {
    return this._postMessage("refreshDurationStart");
  }
  get(logid) {
    return __async(this, null, function* () {
      return (yield this._postMessage("get", logid)).result;
    });
  }
  getAll() {
    return __async(this, null, function* () {
      return (yield this._postMessage("getAll")).result;
    });
  }
  download(_0) {
    return __async(this, arguments, function* ({ filter, keys }) {
      return (yield this._postMessage("download", {
        filter: FuncFilter.transFunc(filter),
        keys
      })).result;
    });
  }
  filter(filter) {
    return __async(this, null, function* () {
      return (yield this._postMessage("filter", FuncFilter.transFunc(filter))).result;
    });
  }
  _postMessage(type, data = null) {
    return new Promise((resolve) => {
      const message = {
        msgid: msgid++,
        type,
        id: this.id,
        data
      };
      this.resolveMap[message.msgid] = resolve;
      worker.postMessage(message);
    });
  }
  _transformPayload(data) {
    if (data.payload instanceof window.HTMLElement) {
      data.payload = transformDOM(data.payload);
    }
    return data;
  }
};

// src/filter-json/filter.ts
function checkValue(value, condition) {
  if (typeof condition === "function") {
    return condition(value);
  } else if (typeof value === "object") {
    if (value.constructor.name === "Object") {
      if (condition instanceof Array) {
        for (let i = 0; i < condition.length; i++) {
          const filter = condition[i];
          if (checkValue(value, filter))
            return true;
        }
        return false;
      } else {
        for (const k in condition) {
          const val = value[k];
          const filter = condition[k];
          if (!checkValue(val, filter))
            return false;
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

// src/store/storage.ts
var StorageStore = class extends DBBase {
  constructor(data) {
    super(data);
    this.data = [];
    this.key = `${BaseInfo.DEFAULT_DB_NAME_PREFIX}_${data.id}`;
    this.onDiscard = data.onDiscard;
    this.onReport = data.onReport;
    this._initStoreType(data.storeType);
    this.data = this._getAll();
  }
  get useStorage() {
    return this.type === "storage";
  }
  get useTemp() {
    return this.type === "temp";
  }
  get noStore() {
    return this.type === "none";
  }
  _initStoreType(storeType) {
    if (!window.localStorage && storeType === "storage") {
      storeType = "temp";
    }
    this.type = storeType;
  }
  _getAll() {
    if (this.useStorage) {
      return JSON.parse(localStorage.getItem(this.key) || "[]");
    } else {
      return [];
    }
  }
  _saveAll() {
    if (this.useStorage) {
      try {
        localStorage.setItem(this.key, JSON.stringify(this.data));
      } catch (e) {
        TLog.warn("localStorage \u5B58\u50A8\u5931\u8D25", e);
      }
    }
  }
  add(data) {
    const dbData = this.baseInfo.appendBaseInfo(data);
    let discard = null;
    if (this.useTemp || this.useStorage) {
      const max = this.baseInfo.config.maxRecords;
      if (this.data.length >= max) {
        const item = this.data.shift();
        if (item) {
          discard = item;
          if (this.onDiscard)
            this.onDiscard(dbData);
          TLog.warn(`\u8FBE\u5230\u6700\u5927\u5B58\u50A8\u6570\u91CF\uFF1A${max}; \u5DF2\u4E22\u5F03\u6700\u65E9\u7684\u8BB0\u5F55\uFF1A`, item);
        }
      }
      if (this.onReport)
        this.onReport(dbData);
      this.data.push(dbData);
      this._saveAll();
    }
    return Promise.resolve({
      discard,
      add: dbData
    });
  }
  close() {
    return Promise.resolve(true);
  }
  destory() {
    this.data = [];
    localStorage.removeItem(this.key);
    return Promise.resolve(true);
  }
  get(logid) {
    return Promise.resolve(this.data.find((d) => d.logid === logid) || null);
  }
  clear() {
    this.data = [];
    this._saveAll();
    return Promise.resolve(true);
  }
  delete(logid) {
    const index = this.data.findIndex((item) => item.logid === logid);
    if (index === -1)
      return Promise.resolve(false);
    this.data.splice(index, 1);
    this._saveAll();
    return Promise.resolve(true);
  }
  count() {
    return Promise.resolve(this.data.length);
  }
  download({ filter, keys }) {
    let content = "";
    let count = 0;
    for (let i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      if (checkValue(item, filter)) {
        count++;
        content += dataToLogString(item, keys) + "\n";
      }
    }
    return Promise.resolve({ content, count });
  }
  filter(filter) {
    if (this.noStore)
      return Promise.resolve([]);
    return Promise.resolve(this.data.filter((d) => {
      return checkValue(d, filter);
    }));
  }
  getAll() {
    if (this.noStore)
      return Promise.resolve([]);
    return Promise.resolve(this.data);
  }
};

// src/version.ts
var version_default = "0.0.1";

// src/logger.ts
var Logger = class {
  constructor({
    id = "default",
    useConsole = true,
    storeType = "idb",
    maxRecords = 1e4,
    baseInfo,
    onReport,
    onDiscard
  } = {}) {
    this._store = LoggerHelper.initStore({
      id,
      storeType,
      maxRecords,
      useConsole,
      onReport,
      onDiscard
    });
    this.storeType = this._store.type;
    this.id = id;
    this.injectBaseInfo(baseInfo);
  }
  injectBaseInfo(baseInfo = {}) {
    baseInfo.uid = LoggerHelper.initUUid("_tc_logger_uid", baseInfo == null ? void 0 : baseInfo.uid);
    baseInfo.clientid = LoggerHelper.initUUid("_tc_logger_clientid", baseInfo == null ? void 0 : baseInfo.clientid);
    baseInfo.url = baseInfo.url || window.location.href;
    baseInfo.ua = baseInfo.ua || window.navigator.userAgent;
    return this._store.injectBaseInfo(baseInfo);
  }
  log(...args) {
    return this._logCommon(args, "log");
  }
  error(...args) {
    return this._logCommon(args, "error");
  }
  warn(...args) {
    return this._logCommon(args, "warn");
  }
  info(...args) {
    return this._logCommon(args, "info");
  }
  _logCommon(args, type) {
    const data = LoggerHelper.buildLogData(args, type);
    return this._store.add(data);
  }
  close() {
    return this._store.close();
  }
  destory() {
    return this._store.destory();
  }
  clear() {
    return this._store.clear();
  }
  count() {
    return this._store.count();
  }
  delete(logid) {
    return this._store.delete(logid);
  }
  refreshTraceId() {
    return this._store.refreshTraceId();
  }
  refreshDurationStart() {
    return this._store.refreshDurationStart();
  }
  download(_0) {
    return __async(this, arguments, function* ({
      name,
      filter,
      keys
    }) {
      if (!name)
        name = dateToStr(new Date(), "_");
      const { content, count } = yield this._store.download({ filter, keys });
      download({ name: `${name}.log`, content });
      return count;
    });
  }
  get(logid) {
    return this._store.get(logid);
  }
  getAll() {
    return this._store.getAll();
  }
  filter(filter) {
    if (!filter) {
      return this.getAll();
    }
    return this._store.filter(filter);
  }
};
Logger.version = version_default;
var LoggerHelper = {
  buildLogData(args, type = "log") {
    let msg = "__def__";
    let payload = args;
    let extend = void 0;
    const arg1 = args[0];
    const arg1Type = typeof arg1;
    if (arg1Type === "string" || arg1Type === "number") {
      msg = `${arg1}`;
      payload = args.slice(1);
    } else if (args.length === 1 && isJson(arg1)) {
      extend = arg1;
      payload = [];
    }
    const data = {
      msg,
      type,
      extend
    };
    if (payload.length > 0) {
      data.payload = payload;
    }
    return data;
  },
  initUUid(key, id) {
    if (id) {
      window.localStorage.setItem(key, id);
      return id;
    } else {
      let id2 = window.localStorage.getItem(key);
      if (!id2) {
        id2 = uuid();
        window.localStorage.setItem(key, id2);
      }
      return id2;
    }
  },
  initStore({
    id,
    storeType,
    maxRecords,
    useConsole,
    onReport,
    onDiscard
  }) {
    const canUseIndexedDB = !!window.Worker && !!window.indexedDB;
    const options = { id, useConsole, maxRecords, onReport, onDiscard };
    if (storeType === "idb" && canUseIndexedDB) {
      return new WorkerStore(options);
    } else {
      return new StorageStore(__spreadProps(__spreadValues({}, options), {
        storeType
      }));
    }
  }
};
var logger_default = Logger;

// src/index.ts
var src_default = logger_default;

// scripts/dev/index.ts
var win = window;
win.lg = new src_default({
  id: "main",
  storeType: "idb",
  onReport(d) {
    console.warn("onReport", d);
  },
  maxRecords: 10
});
win.lg2 = new src_default({
  id: "main",
  storeType: "storage",
  onReport(d) {
    console.warn("onReport", d);
  },
  maxRecords: 10
});
//# sourceMappingURL=bundle.js.map
