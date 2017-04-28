import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { getReducer, setQueryURL, checkAuthentication } from 'sparql-connect';
import App from './App';

const store = createStore(getReducer());

checkAuthentication().then(() => ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
));
