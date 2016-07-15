'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.axiosStatusConst = exports.axiosConstants = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axiosConstants = exports.axiosConstants = {
	AXIOS_REQUEST: 'REQUEST',
	AXIOS_RESPONSE: 'RESPONSE',
	AXIOS_ERROR: 'ERROR',
	AXIOS_REMOVE: 'REMOVE'
};
var axiosStatusConst = exports.axiosStatusConst = {
	PEN: 'PENDING',
	SUCC: 'SUCCESS',
	ERR: 'ERROR',
	REM: 'REMOVED'
};

var AsyncService = function () {
	function AsyncService(props) {
		_classCallCheck(this, AsyncService);

		this.apiObj = {};
	}

	_createClass(AsyncService, [{
		key: 'register',
		value: function register(apis, headers) {
			var _this = this;

			if (!apis) {
				return this.apiObj;
			}

			headers = headers || function () {
				return {};
			};

			var _loop = function _loop(key) {
				_this.apiObj[key] = _this.apiObj[key] || {};
				_this.apiObj[key]['actionCreator'] = {
					get: function get(data) {
						return fetchData(key, apis[key], 'get', data, headers());
					},
					put: function put(data) {
						return fetchData(key, apis[key], 'put', data, headers());
					},
					post: function post(data) {
						return fetchData(key, apis[key], 'post', data, headers());
					},
					delete: function _delete(data) {
						return fetchData(key, apis[key], 'delete', data, headers());
					}
				};
				_this.apiObj[key]['remove'] = function () {
					return removeApi(key);
				};
				_this.apiObj[key]['reducer'] = function () {
					var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
					var action = arguments[1];

					if (!('type' in action)) {
						return state;
					}

					var nextState = Object.assign({}, state);
					switch (action.type) {
						case key + '-' + axiosConstants.AXIOS_REQUEST:
							nextState['status'] = axiosStatusConst.PEN;
							nextState['request'] = action.payload;
							nextState['lastUpdated'] = action.receivedAt;
							break;
						case key + '-' + axiosConstants.AXIOS_RESPONSE:
							nextState['status'] = axiosStatusConst.SUCC;
							nextState['httpCode'] = action.payload.status;
							nextState['response'] = action.payload.data;
							nextState['lastUpdated'] = action.receivedAt;
							break;
						case key + '-' + axiosConstants.AXIOS_ERROR:
							nextState['status'] = axiosStatusConst.ERR;
							nextState['httpCode'] = action.payload.status;
							nextState['error'] = action.payload.data;
							nextState['lastUpdated'] = action.receivedAt;
							break;
						case key + '-' + axiosConstants.AXIOS_REMOVE:
							nextState['status'] = axiosStatusConst.REM;
							nextState['lastUpdated'] = action.receivedAt;
							break;
						default:
							return state;
					}
					return nextState;
				};
			};

			for (var key in apis) {
				_loop(key);
			}
			return this.apiObj;
		}
	}, {
		key: 'getReducers',
		value: function getReducers() {
			var apiReducers = {};
			for (var key in this.apiObj) {
				apiReducers[key] = this.apiObj[key].reducer;
			}
			return apiReducers;
		}
	}]);

	return AsyncService;
}();

exports.default = AsyncService;


var requestApi = function requestApi(key, data) {
	return {
		type: key + '-' + axiosConstants.AXIOS_REQUEST,
		payload: data,
		receivedAt: Date.now()
	};
};
var responseApi = function responseApi(key, response) {
	return {
		type: key + '-' + axiosConstants.AXIOS_RESPONSE,
		payload: response,
		receivedAt: Date.now()
	};
};
var errorApi = function errorApi(key, error) {
	return {
		type: key + '-' + axiosConstants.AXIOS_ERROR,
		payload: error,
		receivedAt: Date.now()
	};
};
var removeApi = function removeApi(key) {
	return {
		type: key + '-' + axiosConstants.AXIOS_REMOVE,
		receivedAt: Date.now()
	};
};

var fetchData = function fetchData(key, url, method, data, headers) {
	return function (dispatch) {
		dispatch(requestApi(key, data));
		axiosRequest(key, url, method, data, headers, responseApi, errorApi, dispatch);
	};
};

var axiosRequest = function axiosRequest(key, url, method, data, headers, succCallback, errCallback, dispatch) {
	var dataToSend = void 0;
	if (method && method.toLowerCase() === 'get' && data) {
		dataToSend = '?';
		for (var dataKey in data) {
			dataToSend += dataKey + '=' + data[dataKey];
		}
	} else {
		dataToSend = data;
	}
	return (0, _axios2.default)({
		url: url,
		method: method,
		headers: headers,
		data: dataToSend
	}).then(function (response) {
		dispatch(succCallback(key, response));
	}).catch(function (error) {
		dispatch(errCallback(key, error));
	});
};
//# sourceMappingURL=app.js.map
