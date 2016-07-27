# redux-api-http

Library to send http request while following redux architecture.

**Installation**

> npm install redux-api-http --save

**Importing the service**

it can be imported as a reference of class object
```javascript
import {asyncService} from 'redux-api-http';
```

or, as the class itself
```javascript
import AsyncService from 'redux-api-http';
```

in the first case we can import reducers also as a constant import
```javascript
import {asyncService, apiReducer} from 'redux-api-http';
```

for the second case we need to fetch the reducer by creating object of class
```javascript
import AsyncService from 'redux-api-http';

AsyncService service = new AsyncService();
let reducer = service.getReducer();
```

This service exposes two major function for users `dispatch` method for sending api request and `remove` method for removing api response from the store (the later functionality is useful in some cases)

method signature for `dispatch`
```javascript
dispatch = function(key, api, method, data, headers) {
	// some defination
}
```

here `key` is the unique api identifier used to distinguish api data in store from one another. This package also export a constant object for `method` field
```javascript
apiMethod = {
	GET: 'get',
	POST: 'post',
	PUT: 'put', 
	DELETE: 'delete'
}
```

to import it
```javascript
import {apiMethod} from 'redux-api-http';
```

method signature for `remove`
```javascript
remove = function(key) {
	// some defination
}
```

here `key` is the same key which we used in dispatch method to uniquely identify the api and distinguish its state in the store.

*generalised usage*
```javascript
import {asyncService} from 'redux-api-http';

let data = {
	key1: 'value',
	key2: 'value'
};
let header = {
	header1: 'value',
	header2: 'value'
};

asyncService.dispatch('myApiKey', 'http://mySampleApi.com/service1', 'get', data, header);

asynService.remove('myApiKey');
```

**Example**
```javascript

// Container Component
import React from 'react';
import ReactDOM from 'react-dom';
import {combineReducers, createStore} from 'redux';
import {Provider} from 'react-redux';
import {apiReducer} from 'redux-api-http';
import DummyComponent from '<path>';

let reducers = combineReducers({
	'apiReducer': apiReducer
});
let store = createStore(reducers);

class SomeComponent extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<DummyComponent />
			</Provider>
		);
	}
}
ReactDOM.render(<SomeComponent />, document.getElementById('container'));

// Dummy Component
import React from 'react';
import {asyncService, apiMethod} from 'redux-api-http';

class DummyComponent extends React.Component {
	componentDidMount() {
		this.props.dispatch(asyncService.dispatch('key','http://someapi.com/service', apiMethod.GET, {}, {}));
	}
	
	render() {
		console.log(this.props.someProp);
		return (
			<div>
				dummy component
			</div>
		);
	}
}

// here apiReducer is used because we register our reducer with this name in the above code
let mapStateToProps = (state) => ({
	someProp: state.apiReducer.key
})
export default connect(mapStateToProps)(DummyComponent);
```
