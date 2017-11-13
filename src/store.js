import {createStore, applyMiddleware, compose} from 'redux';

// import {browserHistory} from 'react-router';
import createHistory from 'history/createBrowserHistory';

import {routerMiddleware} from 'react-router-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import TungaApp from './reducers/index';

const history = createHistory()

var enabled_middleware = [thunk, routerMiddleware(history)];
var compose_args = [];

if (!__PRODUCTION__) {
  const logger = createLogger({collapsed: true, level: 'info', duration: true});
  enabled_middleware.push(logger);
  compose_args.push(
    window.devToolsExtension ? window.devToolsExtension() : f => f,
  );
}

let store = createStore(
  TungaApp,
  compose(applyMiddleware(...enabled_middleware), ...compose_args),
);

export default store;
