"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _rpc_client = _interopRequireWildcard(require("./rpc_client.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var DEFAULT_HANDSHAKE_TIMEOUT_MS = 10000; // 10 seconds

var SW_CONNECT_TIMEOUT_MS = 5000; // 5s

var selfWindow = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null;

var BrowserComms = /*#__PURE__*/function () {
  /*
  @param {Object} options
  @param {Number} [options.timeout] - request timeout (ms)
  @param {Number} [options.handShakeTimeout=10000] - handshake timeout (ms)
  @param {Boolean} [options.shouldConnectToServiceWorker] - whether or not we should try comms with service worker
  @param {Function<Boolean>} options.isParentValidFn - restrict parent origin
  */
  function BrowserComms() {
    var _globalThis$window,
        _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BrowserComms);

    var timeout = options.timeout,
        shouldConnectToServiceWorker = options.shouldConnectToServiceWorker,
        _options$handshakeTim = options.handshakeTimeout,
        handshakeTimeout = _options$handshakeTim === void 0 ? DEFAULT_HANDSHAKE_TIMEOUT_MS : _options$handshakeTim,
        _options$isParentVali = options.isParentValidFn,
        isParentValidFn = _options$isParentVali === void 0 ? function () {
      return true;
    } : _options$isParentVali;
    this.handshakeTimeout = handshakeTimeout;
    this.isParentValidFn = isParentValidFn;
    this.isListening = false;
    this.hasParent = typeof window !== 'undefined' && window.self !== window.top;
    this.parent = globalThis === null || globalThis === void 0 ? void 0 : (_globalThis$window = globalThis.window) === null || _globalThis$window === void 0 ? void 0 : _globalThis$window.parent;
    this.client = new _rpc_client["default"]({
      timeout: timeout,
      postMessage: function postMessage(msg, origin) {
        var _this$parent;

        return (_this$parent = _this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.postMessage(msg, origin);
      }
    }); // only use service workers if current page has one we care about

    this.waitForSw = shouldConnectToServiceWorker && waitForServiceWorker(); // All parents must respond to 'ping' with @registeredMethods

    this.registeredMethods = {
      ping: function ping() {
        return Object.keys(_this.registeredMethods);
      }
    };
    this.parentsRegisteredMethods = [];
    this.parentHasMethod = this.parentHasMethod.bind(this);
    this.setParent = this.setParent.bind(this);
    this.listen = this.listen.bind(this);
    this.close = this.close.bind(this);
    this.call = this.call.bind(this);
    this.onRequest = this.onRequest.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.on = this.on.bind(this);
  }

  _createClass(BrowserComms, [{
    key: "setParent",
    value: function setParent(parent) {
      this.parent = parent;
      this.hasParent = true;
    } // Binds global message listener
    // Must be called before .call()

  }, {
    key: "listen",
    value: function listen() {
      var _this2 = this;

      this.isListening = true;
      selfWindow === null || selfWindow === void 0 ? void 0 : selfWindow.addEventListener('message', this.onMessage, true);
      this.waitForParentPing = this.hasParent && this.client.call('ping', null, {
        timeout: this.handshakeTimeout
      }).then(function (registeredMethods) {
        _this2.parentsRegisteredMethods = _this2.parentsRegisteredMethods.concat(registeredMethods);
      })["catch"](function () {
        return null;
      });
      this.waitForSwPing = this.waitForSw && this.waitForSw.then(function () {
        var _this2$sw;

        return (_this2$sw = _this2.sw) === null || _this2$sw === void 0 ? void 0 : _this2$sw.call('ping', null, {
          timeout: _this2.handshakeTimeout
        });
      }).then(function (registeredMethods) {
        _this2.parentsRegisteredMethods = _this2.parentsRegisteredMethods.concat(registeredMethods);
      })["catch"](function () {
        return null;
      });
    }
  }, {
    key: "close",
    value: function close() {
      this.isListening = true;
      return selfWindow === null || selfWindow === void 0 ? void 0 : selfWindow.removeEventListener('message', this.onMessage);
    }
  }, {
    key: "parentHasMethod",
    value: function parentHasMethod(method) {
      return this.parentsRegisteredMethods.indexOf(method) !== -1;
    }
    /*
    @param {String} method
    @param {...*} params
    @returns Promise
    */

  }, {
    key: "call",
    value: function () {
      var _call = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(method) {
        var _this3 = this;

        var localMethod,
            _len,
            params,
            _key,
            parentError,
            result,
            localResult,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.isListening) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  return reject(new Error('Must call listen() before call()'));
                }));

              case 2:
                localMethod = function localMethod(method, params) {
                  var fn = _this3.registeredMethods[method];

                  if (!fn) {
                    throw new Error('Method not found');
                  }

                  return fn.apply(null, params);
                };

                _context.t0 = this.waitForSw;

                if (!_context.t0) {
                  _context.next = 7;
                  break;
                }

                _context.next = 7;
                return this.waitForSw;

              case 7:
                for (_len = _args.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  params[_key - 1] = _args[_key];
                }

                if (!(!this.hasParent && !this.sw)) {
                  _context.next = 12;
                  break;
                }

                return _context.abrupt("return", localMethod(method, params));

              case 12:
                parentError = null;
                _context.t1 = this.waitForParentPing;

                if (!_context.t1) {
                  _context.next = 17;
                  break;
                }

                _context.next = 17;
                return this.waitForParentPing;

              case 17:
                _context.t2 = this.waitForSwPing;

                if (!_context.t2) {
                  _context.next = 21;
                  break;
                }

                _context.next = 21;
                return this.waitForSwPing;

              case 21:
                if (this.parentHasMethod(method)) {
                  _context.next = 25;
                  break;
                }

                return _context.abrupt("return", localMethod(method, params));

              case 25:
                _context.prev = 25;

                if (this.hasParent) {
                  _context.next = 28;
                  break;
                }

                throw new Error('No parent');

              case 28:
                _context.next = 30;
                return this.client.call(method, params);

              case 30:
                result = _context.sent;
                _context.next = 59;
                break;

              case 33:
                _context.prev = 33;
                _context.t3 = _context["catch"](25);
                _context.prev = 35;
                parentError = _context.t3;

                if (!this.sw) {
                  _context.next = 49;
                  break;
                }

                _context.prev = 38;
                _context.next = 41;
                return this.sw.call(method, params);

              case 41:
                result = _context.sent;
                _context.next = 47;
                break;

              case 44:
                _context.prev = 44;
                _context.t4 = _context["catch"](38);
                return _context.abrupt("return", localMethod(method, params));

              case 47:
                _context.next = 50;
                break;

              case 49:
                return _context.abrupt("return", localMethod(method, params));

              case 50:
                _context.next = 59;
                break;

              case 52:
                _context.prev = 52;
                _context.t5 = _context["catch"](35);

                if (!(_context.t5.message === 'Method not found' && parentError)) {
                  _context.next = 58;
                  break;
                }

                throw parentError;

              case 58:
                throw _context.t5;

              case 59:
                // need to send back methods for all parent frames
                if (method === 'ping') {
                  localResult = localMethod(method, params);
                  result = (result || []).concat(localResult);
                }

                return _context.abrupt("return", result);

              case 61:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[25, 33], [35, 52], [38, 44]]);
      }));

      function call(_x) {
        return _call.apply(this, arguments);
      }

      return call;
    }()
  }, {
    key: "onRequest",
    value: function () {
      var _onRequest = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(reply, request, e) {
        var params, _i, _Array$from, param, result;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // replace callback params with proxy functions
                params = [];

                for (_i = 0, _Array$from = Array.from(request.params || []); _i < _Array$from.length; _i++) {
                  param = _Array$from[_i];

                  if ((0, _rpc_client.isRPCCallback)(param)) {
                    (function (param) {
                      return params.push(function () {
                        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                          args[_key2] = arguments[_key2];
                        }

                        return reply((0, _rpc_client.createRPCCallbackResponse)({
                          params: args,
                          callbackId: param.callbackId
                        }));
                      });
                    })(param);
                  } else {
                    params.push(param);
                  }
                } // acknowledge request, prevent request timeout


                reply((0, _rpc_client.createRPCRequestAcknowledgement)({
                  requestId: request.id
                }));
                _context2.prev = 3;
                _context2.next = 6;
                return this.call.apply(this, [request.method].concat(_toConsumableArray(Array.from(params)), [{
                  e: e
                }]));

              case 6:
                result = _context2.sent;
                return _context2.abrupt("return", reply((0, _rpc_client.createRPCResponse)({
                  requestId: request.id,
                  result: result
                })));

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](3);
                return _context2.abrupt("return", reply((0, _rpc_client.createRPCResponse)({
                  requestId: request.id,
                  rPCError: (0, _rpc_client.createRPCError)({
                    code: _rpc_client.ERROR_CODES.DEFAULT,
                    data: _context2.t0
                  })
                })));

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[3, 10]]);
      }));

      function onRequest(_x2, _x3, _x4) {
        return _onRequest.apply(this, arguments);
      }

      return onRequest;
    }()
  }, {
    key: "onMessage",
    value: function onMessage(e) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          isServiceWorker = _ref.isServiceWorker;

      try {
        // silent
        var message = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

        if (!(0, _rpc_client.isRPCEntity)(message)) {
          return; // non-browsercomms message
        }

        var reply = function reply(message) {
          if (typeof window !== 'undefined' && window !== null) {
            var _e$source;

            return (_e$source = e.source) === null || _e$source === void 0 ? void 0 : _e$source.postMessage(JSON.stringify(message), '*');
          } else {
            return e.ports[0].postMessage(JSON.stringify(message));
          }
        };

        if ((0, _rpc_client.isRPCRequest)(message)) {
          return this.onRequest(reply, message, e);
        } else if ((0, _rpc_client.isRPCEntity)(message)) {
          var rpc;

          if (this.isParentValidFn(e.origin)) {
            rpc = isServiceWorker ? this.sw : this.client;
            return rpc.resolve(message);
          } else if ((0, _rpc_client.isRPCResponse)(message)) {
            rpc = isServiceWorker ? this.sw : this.client;
            return rpc.resolve((0, _rpc_client.createRPCResponse)({
              requestId: message.id,
              rPCError: (0, _rpc_client.createRPCError)({
                code: _rpc_client.ERROR_CODES.INVALID_ORIGIN
              })
            }));
          } else {
            throw new Error('Invalid origin');
          }
        } else {
          throw new Error('Unknown RPCEntity type');
        }
      } catch (err) {}
    }
    /*
    * Register method to be called on child request, or local request fallback
    @param {String} method
    @param {Function} fn
    */

  }, {
    key: "on",
    value: function on(method, fn) {
      this.registeredMethods[method] = fn;
    }
  }]);

  return BrowserComms;
}();

var _default = BrowserComms;
exports["default"] = _default;

function waitForServiceWorker() {
  var _this4 = this;

  return new Promise(function (resolve, reject) {
    var _navigator, _navigator$serviceWor;

    var readyTimeout = setTimeout(resolve, SW_CONNECT_TIMEOUT_MS);
    return (_navigator = navigator) === null || _navigator === void 0 ? void 0 : (_navigator$serviceWor = _navigator.serviceWorker) === null || _navigator$serviceWor === void 0 ? void 0 : _navigator$serviceWor.ready["catch"](function () {
      console.log('caught sw error');
      return null;
    }).then(function (registration) {
      var worker = registration === null || registration === void 0 ? void 0 : registration.active;

      if (worker) {
        _this4.sw = new _rpc_client["default"]({
          timeout: _this4.timeout,
          postMessage: function postMessage(msg, origin) {
            var swMessageChannel = new MessageChannel();

            if (swMessageChannel) {
              swMessageChannel.port1.onmessage = function (e) {
                return _this4.onMessage(e, {
                  isServiceWorker: true
                });
              };

              return worker.postMessage(msg, [swMessageChannel.port2]);
            }
          }
        });
      }

      clearTimeout(readyTimeout);
      return resolve();
    });
  });
}