"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuid = _interopRequireDefault(require("uuid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ERROR_CODES = {
  METHOD_NOT_FOUND: -32601,
  INVALID_ORIGIN: 100,
  DEFAULT: -1
};
var ERROR_MESSAGES = {};
ERROR_MESSAGES[ERROR_CODES.METHOD_NOT_FOUND] = 'Method not found';
ERROR_MESSAGES[ERROR_CODES.INVALID_ORIGIN] = 'Invalid origin';
ERROR_MESSAGES[ERROR_CODES.DEFAULT] = 'Error';
var DEFAULT_REQUEST_TIMEOUT_MS = 3000;

var deferredFactory = function deferredFactory() {
  var resolve = null;
  var reject = null;
  var promise = new Promise(function (_resolve, _reject) {
    resolve = _resolve;
    reject = _reject;
    return reject;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};

var RPCClient = /*#__PURE__*/function () {
  function RPCClient() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        postMessage = _ref.postMessage,
        _ref$timeout = _ref.timeout,
        _timeout = _ref$timeout === void 0 ? DEFAULT_REQUEST_TIMEOUT_MS : _ref$timeout;

    _classCallCheck(this, RPCClient);

    _defineProperty(this, "call", function (method, reqParams) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _options$timeout = options.timeout,
          timeout = _options$timeout === void 0 ? _this.timeout : _options$timeout;
      var deferred = deferredFactory();
      var params = []; // replace callback params

      for (var _i = 0, _Array$from = Array.from(reqParams || []); _i < _Array$from.length; _i++) {
        var param = _Array$from[_i];

        if (typeof param === 'function') {
          var callback = RPCClient.createRPCCallback(param);
          _this.callbackFunctions[callback.callbackId] = param;
          params.push(callback);
        } else {
          params.push(param);
        }
      }

      var request = RPCClient.createRPCRequest({
        method: method,
        params: params
      });
      _this.pendingRequests[request.id] = {
        reject: deferred.reject,
        resolve: deferred.resolve,
        isAcknowledged: false
      };

      try {
        _this.postMessage(JSON.stringify(request), '*');
      } catch (err) {
        deferred.reject(err);
        return deferred;
      }

      setTimeout(function () {
        if (!_this.pendingRequests[request.id].isAcknowledged) {
          return deferred.reject(new Error('Message Timeout'));
        }
      }, timeout);
      return deferred;
    });

    _defineProperty(this, "resolve", function (response) {
      switch (false) {
        case !RPCClient.isRPCRequestAcknowledgement(response):
          return _this.resolveRPCRequestAcknowledgement(response);

        case !RPCClient.isRPCResponse(response):
          return _this.resolveRPCResponse(response);

        case !RPCClient.isRPCCallbackResponse(response):
          return _this.resolveRPCCallbackResponse(response);

        default:
          throw new Error('Unknown response type');
      }
    });

    _defineProperty(this, "resolveRPCResponse", function (rPCResponse) {
      var request = _this.pendingRequests[rPCResponse.id];

      if (request == null) {
        throw new Error('Request not found');
      }

      request.isAcknowledged = true;
      var result = rPCResponse.result,
          error = rPCResponse.error;

      if (error) {
        request.reject(error.data || new Error(error.message));
      } else if (result != null) {
        request.resolve(result);
      } else {
        request.resolve(null);
      }

      return null;
    });

    this.postMessage = postMessage;
    this.timeout = _timeout;
    this.pendingRequests = {};
    this.callbackFunctions = {};
  }

  _createClass(RPCClient, [{
    key: "resolveRPCRequestAcknowledgement",
    value:
    /*
    @param {RPCRequestAcknowledgement} rPCRequestAcknowledgement
    */
    function resolveRPCRequestAcknowledgement(rPCRequestAcknowledgement) {
      var request = this.pendingRequests[rPCRequestAcknowledgement.id];

      if (request == null) {
        throw new Error('Request not found');
      }

      request.isAcknowledged = true;
      return null;
    }
    /*
    @param {RPCCallbackResponse} rPCCallbackResponse
    */

  }, {
    key: "resolveRPCCallbackResponse",
    value: function resolveRPCCallbackResponse(rPCCallbackResponse) {
      var callbackFn = this.callbackFunctions[rPCCallbackResponse.callbackId];

      if (callbackFn == null) {
        throw new Error('Callback not found');
      }

      callbackFn.apply(null, rPCCallbackResponse.params);
      return null;
    }
  }], [{
    key: "createRPCRequest",
    value:
    /*
    @typedef {Object} RPCRequest
    @property {Boolean} _browserComms - Must be true
    @property {String} id
    @property {String} method
    @property {Array<*>} params
     @param {Object} props
    @param {String} props.method
    @param {Array<*>} [props.params] - Functions are not allowed
    @returns RPCRequest
    */
    function createRPCRequest(_ref2) {
      var method = _ref2.method,
          params = _ref2.params;

      if (params == null) {
        throw new Error('Must provide params');
      }

      for (var _i2 = 0, _Array$from2 = Array.from(params); _i2 < _Array$from2.length; _i2++) {
        var param = _Array$from2[_i2];

        if (typeof param === 'function') {
          throw new Error('Functions are not allowed. Use RPCCallback instead.');
        }
      }

      return {
        _browserComms: true,
        id: _uuid["default"].v4(),
        method: method,
        params: params
      };
    }
    /*
    @typedef {Object} RPCCallback
    @property {Boolean} _browserComms - Must be true
    @property {String} callbackId
    @property {Boolean} _browserCommsGunCallback - Must be true
     @returns RPCCallback
    */

  }, {
    key: "createRPCCallback",
    value: function createRPCCallback() {
      return {
        _browserComms: true,
        _browserCommsGunCallback: true,
        callbackId: _uuid["default"].v4()
      };
    }
    /*
    @typedef {Object} RPCCallbackResponse
    @property {Boolean} _browserComms - Must be true
    @property {String} callbackId
    @property {Array<*>} params
     @param {Object} props
    @param {Array<*>} props.params
    @param {String} props.callbackId
    @returns RPCCallbackResponse
    */

  }, {
    key: "createRPCCallbackResponse",
    value: function createRPCCallbackResponse(_ref3) {
      var params = _ref3.params,
          callbackId = _ref3.callbackId;
      return {
        _browserComms: true,
        callbackId: callbackId,
        params: params
      };
    }
    /*
    @typedef {Object} RPCRequestAcknowledgement
    @property {Boolean} _browserComms - Must be true
    @property {String} id
    @property {Boolean} acknowledge - must be true
     @param {Object} props
    @param {String} props.responseId
    @returns RPCRequestAcknowledgement
    */

  }, {
    key: "createRPCRequestAcknowledgement",
    value: function createRPCRequestAcknowledgement(_ref4) {
      var requestId = _ref4.requestId;
      return {
        _browserComms: true,
        id: requestId,
        acknowledge: true
      };
    }
    /*
    @typedef {Object} RPCResponse
    @property {Boolean} _browserComms - Must be true
    @property {String} id
    @property {*} result
    @property {RPCError} error
     @param {Object} props
    @param {String} props.requestId
    @param {*} [props.result]
    @param {RPCError|Null} [props.error]
    @returns RPCResponse
    */

  }, {
    key: "createRPCResponse",
    value: function createRPCResponse(_ref5) {
      var requestId = _ref5.requestId,
          _ref5$result = _ref5.result,
          result = _ref5$result === void 0 ? null : _ref5$result,
          _ref5$rPCError = _ref5.rPCError,
          rPCError = _ref5$rPCError === void 0 ? null : _ref5$rPCError;
      return {
        _browserComms: true,
        id: requestId,
        result: result,
        error: rPCError
      };
    }
    /*
    @typedef {Object} RPCError
    @property {Boolean} _browserComms - Must be true
    @property {Integer} code
    @property {String} message
    @property {Object} data - optional
     @param {Object} props
    @param {Errpr} [props.error]
    @returns RPCError
    */

  }, {
    key: "createRPCError",
    value: function createRPCError(_ref6) {
      var code = _ref6.code,
          _ref6$data = _ref6.data,
          data = _ref6$data === void 0 ? null : _ref6$data;
      var message = ERROR_MESSAGES[code];
      return {
        _browserComms: true,
        code: code,
        message: message,
        data: data
      };
    }
  }, {
    key: "isRPCEntity",
    value: function isRPCEntity(entity) {
      return entity === null || entity === void 0 ? void 0 : entity._browserComms;
    }
  }, {
    key: "isRPCRequest",
    value: function isRPCRequest(request) {
      return (request === null || request === void 0 ? void 0 : request.id) != null && request.method != null;
    }
  }, {
    key: "isRPCCallback",
    value: function isRPCCallback(callback) {
      return callback === null || callback === void 0 ? void 0 : callback._browserCommsGunCallback;
    }
  }, {
    key: "isRPCResponse",
    value: function isRPCResponse(response) {
      return (response === null || response === void 0 ? void 0 : response.id) && (response.result !== undefined || response.error !== undefined);
    }
  }, {
    key: "isRPCCallbackResponse",
    value: function isRPCCallbackResponse(response) {
      return (response === null || response === void 0 ? void 0 : response.callbackId) && response.params != null;
    }
  }, {
    key: "isRPCRequestAcknowledgement",
    value: function isRPCRequestAcknowledgement(ack) {
      return (ack === null || ack === void 0 ? void 0 : ack.acknowledge) === true;
    }
    /*
    @param {String} method
    @param {Array<*>} [params]
    @returns {Promise}
    */

  }]);

  return RPCClient;
}();

exports["default"] = RPCClient;

_defineProperty(RPCClient, "ERROR_CODES", ERROR_CODES);

_defineProperty(RPCClient, "ERROR_MESSAGES", ERROR_MESSAGES);