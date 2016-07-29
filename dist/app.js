'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.apiReducer = exports.asyncService = exports.apiMethods = exports.status = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var actionConstant = 'redux-api-http/';
var apiAction = {
	REQUEST: 'REQUEST',
	RESPONSE: 'RESPONSE',
	ERROR: 'ERROR',
	REMOVE: 'REMOVE'
};
var status = exports.status = {
	PEN: 'PENDING',
	SUCC: 'SUCCESS',
	ERR: 'ERROR',
	REM: 'REMOVED'
};
var apiMethods = exports.apiMethods = {
	GET: 'get',
	POST: 'post',
	PUT: 'put',
	DELETE: 'delete'
};

var generateActionType = function generateActionType(action) {
	return actionConstant + action;
};

var requestApi = function requestApi(key, url, method, data, headers) {
	return {
		type: generateActionType(apiAction.REQUEST),
		payload: {
			key: key,
			api: url,
			method: method,
			data: data,
			headers: headers
		},
		receivedAt: Date.now()
	};
};
var responseApi = function responseApi(key, response) {
	return {
		type: generateActionType(apiAction.RESPONSE),
		payload: {
			key: key,
			status: response.status,
			data: response.data
		},
		receivedAt: Date.now()
	};
};
var errorApi = function errorApi(key, error) {
	return {
		type: generateActionType(apiAction.ERROR),
		payload: {
			key: key,
			status: error.status,
			data: error.data
		},
		receivedAt: Date.now()
	};
};
var removeApi = function removeApi(key) {
	return {
		type: generateActionType(apiAction.REMOVE),
		payload: {
			key: key
		},
		receivedAt: Date.now()
	};
};

var fetchData = function fetchData(key, url, method, data, headers) {
	return function (dispatch) {
		dispatch(requestApi(key, url, method, data, headers));
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

var AsyncService = function () {
	function AsyncService() {
		_classCallCheck(this, AsyncService);
	}

	_createClass(AsyncService, [{
		key: 'dispatch',
		value: function dispatch(key, api, method, data, headers) {
			data = data || {};
			headers = headers || {};
			method = method || apiMethods.GET;

			return fetchData(key, api, method.toLowerCase(), data, headers);
		}
	}, {
		key: 'remove',
		value: function remove(key) {
			return removeApi(key);
		}
	}, {
		key: 'getReducer',
		value: function getReducer() {
			var initialState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return function () {
				var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
				var action = arguments[1];

				if (!('type' in action) || !action.type.startsWith(actionConstant)) {
					return state;
				}

				var actionType = action.type.substr(actionConstant.length);
				var apiKey = action.payload.key;

				var nextState = Object.assign({}, state);
				nextState[apiKey] = Object.assign({}, state[apiKey]);

				nextState[apiKey] = nextState[apiKey] || {};
				nextState[apiKey]['lastUpdated'] = action.receivedAt;
				switch (actionType) {
					case apiAction.REQUEST:
						nextState[apiKey]['api'] = action.payload.api;
						nextState[apiKey]['status'] = status.PEN;

						nextState[apiKey]['request'] = {};
						nextState[apiKey]['response'] = {};
						nextState[apiKey]['request']['headers'] = action.payload.headers;
						nextState[apiKey]['request']['data'] = action.payload.data;
						break;
					case apiAction.RESPONSE:
						nextState[apiKey]['status'] = status.SUCC;
						nextState[apiKey]['httpCode'] = action.payload.status;
						nextState[apiKey]['response'] = action.payload.data;
						break;
					case apiAction.ERROR:
						nextState[apiKey]['status'] = status.ERR;
						nextState[apiKey]['httpCode'] = action.payload.status;
						nextState[apiKey]['response'] = action.payload.data;
						break;
					case apiAction.REMOVE:
						nextState[apiKey]['status'] = status.REM;

						nextState[apiKey]['request'] = {};
						nextState[apiKey]['response'] = {};
						nextState[apiKey]['status'] = undefined;
						break;
					default:
						return state;
				}
				return nextState;
			};
		}
	}]);

	return AsyncService;
}();

exports.default = AsyncService;
var asyncService = exports.asyncService = new AsyncService();
var apiReducer = exports.apiReducer = asyncService.getReducer();
//# sourceMappingURL=app.js.map
