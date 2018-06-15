import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

export default createStore(reducer, applyMiddleware(thunk));

// Through apply the redux-thunk middleware, we can dispatch a function not only a plain object!