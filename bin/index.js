import axios from 'axios';

const actionConstant = 'redux-api-http/';
let apiAction = {
	REQUEST: 'REQUEST',
	RESPONSE: 'RESPONSE',
	ERROR: 'ERROR',
	REMOVE: 'REMOVE'
};
export const status = {
	PEN: 'PENDING',
	SUCC: 'SUCCESS',
	ERR: 'ERROR',
	REM: 'REMOVED'
};
export const apiMethods = {
	GET: 'get',
	POST: 'post',
	PUT: 'put', 
	DELETE: 'delete'
}


let generateActionType = (action) => {
	return actionConstant + action;
}

let requestApi = (key, url, method, data, headers) => {
	return {
		type: generateActionType(apiAction.REQUEST),
		payload: {
			key,
			api: url,
			method,
			data,
			headers
		},
		receivedAt: Date.now()
	}
}
let responseApi = (key, response) => {
	return {
		type: generateActionType(apiAction.RESPONSE),
		payload: {
			key,
			status: response.status,
			data: response.data
		},
		receivedAt: Date.now()
	}
}
let errorApi = (key, error) => {
	return {
		type: generateActionType(apiAction.ERROR),
		payload: {
			key,
			status: error.status,
			data: error.data
		},
		receivedAt: Date.now()
	}
}
let removeApi = (key) => {
	return {
		type: generateActionType(apiAction.REMOVE),
		receivedAt: Date.now()
	}
}

const fetchData = (key, url, method, data, headers) => {
	return ((dispatch) => {
		dispatch(requestApi(key, url, method, data, headers));
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

export default class AsyncService {

	dispatch(key, api, method, data, headers) {
		data = data || {};
		headers = headers || {};
		method = method || apiMethods.GET;

		return fetchData(key, api, method.toLowerCase(), data, headers);
	}

	remove(key) {
		return removeApi(key);
	}

	getReducer(initialState={}) {
		return (state=initialState, action) => {
			if(!('type' in action) || !action.type.startsWith(actionConstant)) {
				return state;
			}

			let nextState = Object.assign({}, state);
			let actionType = action.type.substr(actionConstant.length);
			let apiKey = action.payload.key;

			nextState[apiKey] = nextState[apiKey] || {};
			nextState[apiKey]['lastUpdated'] = action.receivedAt;
			switch(actionType) {
				case apiAction.REQUEST:
					nextState[apiKey]['api'] = action.payload.api;
					nextState[apiKey]['status'] = status.PEN;

					nextState[apiKey]['request'] = nextState[apiKey]['request'] || {}
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
					break;
				default:
					return state;
			}
			return nextState;
		}
	}
}

export const asyncService = new AsyncService();
export const apiReducer = asyncService.getReducer();
