'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FAILED = exports.LOADING = exports.LOADED = exports.buildSparqlConnector = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionCreators = require('./action-creators');

var _connect = require('./connect');

var _reducer = require('./reducer');

var _remoteConstants = require('./remote-constants');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * Build utility functions to connect components to documented sparql queries
 * 
 * It returns:
 * - `reducer`: a reducer function;
 * - `enhanceReducer`: a reducer enhancer that allows to embed the reducer in an
 * existing recucer. Called with a main reducer, it will add a `results` entry
 * to the state; all the data under this entry will be related to sparql queries
 * and will be handled by dedicated reducers;
 * - `sparqlConnect`: a collection of functions (one per query) that enable to
 * feed a component with the results of sparql query;
 * - `setFetchQuery`: a function to set the function that will be use by the
 * action creators to send the query to the server; this function is useful
 * when we do not have a proper fetch function when we bootstrap the application
 * (for instance if we need to ask for credentials first).
 *
 * The `collect` functions will expose special props to the wrapped component:
 * - loaded (LOADING, LOADED, FAILED): status of the query;
 * - the results, with the `whatWeGet` property of the query documentation as
 * a name (it allows to manipulate the results in the wrapped component with
 * a meaningful name, not just a generic `results` name).
 *
 * The documentation of a query must contain:
 * - `queryBuilder`: a function that takes arguments extracted from props and 
 * returns the query string;
 * - `whatWeGet`: a string that will be used as a prop name for the results
 * that will be passed to the component;
 * - `results`: an array which describes each expected field (`name` and
 * `descr`); this description will be used to build the results passed to the
 * component; if not provided, results structure will be based on the
 * descrption returned by the server in `heads.var` (see
 * https://www.w3.org/TR/sparql11-results-json/sparql);
 * - `params`: an array describing the parameters needed to build the query;
 * these parameters must be passed as `props` to the enhanced component.
 * 
 * @param  {Object} queries     documented queries
 * @param  {Object} fetchQuery  sends the query to the server and returns a
 *                              promise that resolves to results (optional)
 * @param  {String} sparqlName  the key to access the sparql reducer
 * @return {Object}             utilities to connect to sparql queries
 */
function buildSparqlConnector(queries, fetchQuery, sparqlName) {
  //If `sparqlName` is set and not empty, it will return a reducer enhancer. So
  //to access the piece of state concerning the spaql queries, we will need to
  //extract the `sparqlName` entry from the state.
  //I `sparqlName` is not set, it will return a regular reducer.
  var extractState = sparqlName ? function (state) {
    return state[sparqlName];
  } : function (state) {
    return state;
  };
  //Allow setting of `fetchQuery` later, useful to bootsrap the application
  //before having the credentials
  var fetchHolder = { fetchQuery: fetchQuery };

  var _Object$keys$reduce = Object.keys(queries).reduce(function (_ref, queryName) {
    var reducers = _ref.reducers;
    var connectFns = _ref.connectFns;

    var query = queries[queryName];

    var _buildActionCreators = (0, _actionCreators.buildActionCreators)(queryName, query, fetchHolder, extractState);

    var loadIfNeeded = _buildActionCreators.loadIfNeeded;
    var flush = _buildActionCreators.flush;
    var actions = _buildActionCreators.actions;

    reducers[queryName] = (0, _reducer.buildReducer)(query, actions);
    connectFns[queryName] = (0, _connect.buildConnect)(queryName, query, loadIfNeeded, flush, extractState);
    return { reducers: reducers, connectFns: connectFns };
  }, { reducers: {}, connectFns: {} });

  var sparqlReducers = _Object$keys$reduce.reducers;
  var sparqlConnect = _Object$keys$reduce.connectFns;


  var _mainReducer = function _mainReducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];
    return Object.keys(sparqlReducers).reduce(function (states, reducerId) {
      states[reducerId] = sparqlReducers[reducerId](state[reducerId], action);
      return states;
    }, {});
  };

  function _enhanceReducer(reducer) {
    return function enhancedWithSparqlReducer() {
      var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var action = arguments[1];

      //we need to split the state in two parts: the part handled by the main
      //reducer and the part handled by the sparql reducer (under the
      //`results` entry if `sparqlName` was not provided). We could be tempted
      //to give the whole state to both reducers, but if the main reducer was
      //built with `combineReducers`, `redux` will complain about 'unexpected
      //keys' (not harmful but anyway).
      var sparqlState = state[sparqlName];

      var mainState = _objectWithoutProperties(state, [sparqlName]);

      return _extends({}, reducer(mainState, action), _defineProperty({}, sparqlName, _mainReducer(sparqlState, action)));
    };
  }

  var mainReducer = void 0,
      enhanceReducer = void 0;

  if (sparqlName) {
    enhanceReducer = _enhanceReducer;
    mainReducer = function mainReducer() {
      console.warn('`mainReducer` is not expected to be used as is because you ' + '`sparqlName` as third argument of `buildSparqlConnector`. It ' + ('means that results will stay under `' + sparqlName + '` in the state'));
      return _mainReducer.apply(undefined, arguments);
    };
  } else {
    mainReducer = _mainReducer;
    enhanceReducer = function enhanceReducer() {
      throw new Error('To use `enhanceReducer` you need to provide a `sparqlName` as third ' + 'arugment of `buildSparqlConnector`. You should use `mainReducer` ' + 'instead.');
    };
  }

  return {
    mainReducer: mainReducer,
    sparqlConnect: sparqlConnect,
    enhanceReducer: enhanceReducer,
    setFetchQuery: function setFetchQuery(fetchQuery) {
      fetchHolder.fetchQuery = fetchQuery;
    }
  };
}

exports.buildSparqlConnector = buildSparqlConnector;
exports.LOADED = _remoteConstants.LOADED;
exports.LOADING = _remoteConstants.LOADING;
exports.FAILED = _remoteConstants.FAILED;