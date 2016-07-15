import axios from 'axios';

export const axiosConstants = {
	AXIOS_REQUEST: 'REQUEST',
	AXIOS_RESPONSE: 'RESPONSE',
	AXIOS_ERROR: 'ERROR',
	AXIOS_REMOVE: 'REMOVE'
};
export const axiosStatusConst = {
	PEN: 'PENDING',
	SUCC: 'SUCCESS',
	ERR: 'ERROR',
	REM: 'REMOVED'
}

export default class AsyncService {
	constructor(props) {
		this.apiObj = {};
	}

	register(apis, headers) {
		if(!apis) {
			return this.apiObj;
		}

		headers = headers || function() {
			return {

			};
		};

		for(let key in apis) {
			this.apiObj[key] = this.apiObj[key] || {};
			this.apiObj[key]['actionCreator'] = {
				get: (data) => {
					return fetchData(key, apis[key], 'get', data, headers());
				},
				put: (data) => {
					return fetchData(key, apis[key], 'put', data, headers());
				},
				post: (data) => {
					return fetchData(key, apis[key], 'post', data, headers());
				},
				delete: (data) => {
					return fetchData(key, apis[key], 'delete', data, headers());
				}
			};
			this.apiObj[key]['remove'] = () => {
				return removeApi(key);
			};
			this.apiObj[key]['reducer'] = (state={}, action) => {
				if(!('type' in action)) {
					return state;
				}

				let nextState = Object.assign({}, state);
				switch(action.type) {
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
		}
		return this.apiObj;
	}

	getReducers() {
		let apiReducers = {};
		for(let key in this.apiObj) {
			apiReducers[key] = this.apiObj[key].reducer;
		}
		return apiReducers;
	}
}

let requestApi = (key, data) => {
	return {
		type: key + '-' + axiosConstants.AXIOS_REQUEST,
		payload: data,
		receivedAt: Date.now()
	}
}
let responseApi = (key, response) => {
	return {
		type:key + '-' + axiosConstants.AXIOS_RESPONSE,
		payload: response,
		receivedAt: Date.now()
	}
}
let errorApi = (key, error) => {
	return {
		type: key + '-' + axiosConstants.AXIOS_ERROR,
		payload: error,
		receivedAt: Date.now()
	}
}
let removeApi = (key) => {
	return {
		type: key + '-' + axiosConstants.AXIOS_REMOVE,
		receivedAt: Date.now()
	}
}

const fetchData = (key, url, method, data, headers) => {
	return ((dispatch) => {
		dispatch(requestApi(key, data));
		axiosRequest(key, url, method, data, headers, responseApi, errorApi, dispatch);
	});
}

let axiosRequest = (key, url, method, data, headers, succCallback, errCallback, dispatch) => {
	let dataToSend;
	if(method && method.toLowerCase() === 'get' && data) {
		dataToSend = '?'
		for(let dataKey in data) {
			dataToSend += dataKey + '=' + data[dataKey];
		}
	} else {
		dataToSend = data;
	}
	return axios({
		url: url,
		method: method,
		headers: headers,
		data: dataToSend
	})
	.then((response) => {
		dispatch(succCallback(key, response));
	})
	.catch((error) => {
		dispatch(errCallback(key, error));
	});
}
