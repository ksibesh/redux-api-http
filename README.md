# redux-api-http

Library to send http request while following redux architecture.

**Installation**

> npm install redux-api-http --save

**Usage**

Registering API's with the AsyncService

```javascript
import AsyncService from 'redux-api-http';

let api = {
  key1: '<some url>',
  key2: '<some url>'
}
let prepareHeaders = () => {
  return {
    'header1': 'evaluate header / value',
    'header2': 'evaluate header / value'
  }
}

let asyncService = new AsyncService();
let apiObj = asyncService.register(api, prepareHeaders);

const reducers = asyncService.getReducers();  // register these reducers with store, reffer examples in the doc
```

Using in react component using props dispatch method injected by redux connect wrapper

```javascript
let request_obj = {
  'param1': 'value',
  'param2': 'value'
}
```
```javascript
this.props.dispatch(apiObj.key1.actionCreator.get(request_obj));  // here apiObj is the object created in the previous snippet and request_obj are request parameters
```

**Description**

Every key in the api object registered with AsyncService gets 4 http methods which can be called according to use case, following are the methods - 

| method | desc |
| --- | --- |
| get | http get request | 
| post | http post request |
| put | http put request |
| delete | http delete request |

```javascript
apiObj.key1.actionCreator.get(request_obj);
apiObj.key1.actionCreator.put(request_obj);
apiObj.key1.actionCreator.post(request_obj);
apiObj.key1.actionCreator.delete(request_obj);
```

These methods returns an asynchronous action which is needed to be dispatched by store dispatch method.

> Note: We need to use thunk middleware to dispatch asynchronous actions, refer examples

Following are the action dispatched when any of these methods are called

- AXIOS_REQUEST `<key>-REQUEST`
- AXIOS_RESPONSE `<key>-RESPONSE`
- AXIOS_ERROR `<key>-ERROR`

| action | desc |
| --- | --- |
| AXIOS_REQUEST | this action is dispatched when api request is sent |
| AXIOS_RESPONSE | this action is dispatched when api response is received |
| AXIOS_ERROR | this action is dispatched when an error is received as response |

API response can be captured using mapStateToProps method of connect wrapper

```javascript
import React from 'react';
import {connect} from 'react-redux';
import AsyncService from 'redux-api-http';
import store from './config';	// here store is the reference of redux store created by me in config file
import {injectReducer} from './reducer-config';	// injectReducer is a method defined by me in my reducers config file,
												// it register list of reducers with the store

let api = {
	someApi: 'http://url.com/service1'
}
let asyncService = new AsyncService();

let asyncObj = asyncService.register(api, () => ({
	'header1': 'value'
}));
injectReducer(store, asyncService.getReducers());

/*
	injectReducer defination

  export const makeRootReducer = (asyncReducers) => {
  	return combineReducers({
  		router: routerReducer,
  		form: formReducer,
  		...asyncReducers
  	});
  }
	const injectReducer = (store, reducerList) => {
		for(let key in reducerList) {
			store.asyncReducers[key] = reducerList[key];
		}
		store.replaceReducer(makeRootReducer(store.asyncReducers));
	}
*/


class SomeComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    	this.props.dispatch(api.someApi.actionCreator.get({
    		'param1': 'value'
    	}));     
    }

    render() {
    	console.log(this.props.apiResp);
        return (<div>SomeComponent</div>);
    }
}

const mapStateToProps = (state) => ({
    apiResp: state.someApi
})
export default connect(mapStateToProps)(LoginComponent);

```

response caputed by *mapStateToProps* method is in following format

```javascript
{
	'status': 'SUCCESS',
	'lastUpdated': 1468687118532,
	'request': {},
	'httpCode': 200,
	'response': {},
	'error': {}
}
```

Possible values for **status** are `SUCCESS`, `ERROR`, `PENDING` and `REMOVED`

`REMOVED` status is received when we manually remove the api state from store, this can be acived by dispatching following thing

```javascript
 apiObj.key1.remove()
```


