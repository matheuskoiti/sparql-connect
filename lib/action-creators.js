'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildActionCreators = buildActionCreators;

var _results = require('./results');

var _actionConstants = require('./action-constants');

var buildParams = function buildParams(params, args) {
  return params.reduce(function (builtParams, param, i) {
    //TODO check all arguments needed are present
    builtParams[param.name] = args[i];
    return builtParams;
  }, {});
};

function buildActionCreators(queryName, query, fetchQueryHolder, extractState) {
  var paramsDescr = query.params;
  var resultsDescr = query.results;
  var singleResult = query.singleResult;
  var queryBuilder = query.queryBuilder;


  if (queryBuilder === undefined) throw new ReferenceError('No query builder function was provided for `' + queryName + '`');

  var _buildActionConstants = (0, _actionConstants.buildActionConstants)(queryName);

  var LOAD_ACTION = _buildActionConstants.LOAD_ACTION;
  var LOAD_SUCCESS_ACTION = _buildActionConstants.LOAD_SUCCESS_ACTION;
  var LOAD_FAILURE_ACTION = _buildActionConstants.LOAD_FAILURE_ACTION;

  // we build `checkIfNeeded` once for all

  var checkIfNeeded =
  //TODO we should check the status and reload only in it is not LOADED or
  //LOADING
  paramsDescr.length === 0 ? function (pieceOfState) {
    return Object.keys(pieceOfState).length === 0;
  } :
  //There is no real need to distinguish one param only to multiple params,
  //but this special case can help understand the whole picture (plus
  //optimization, but it is surely unsignificant)
  paramsDescr.length === 1 ? function (pieceOfState, args) {
    return !pieceOfState.hasOwnProperty(args[0]);
  } :
  //We check recursively into the state (multiple params mean there is an
  //entry for the first param, and in this entry there is an entry for the
  //second param, and so forth) ; with `Array.every` we could stop as soon
  //as an entry does not exist, but we will need to create a local variable
  //to keep track of the current entry (hence the use of `Array.reduce`). We
  //reduce over `params` instead of `args` so we will be able to add checks
  //if some arguments are missing.
  function (pieceOfState, args) {
    return !paramsDescr.reduce(function (entry, args, i) {
      return entry && entry.hasOwnProperty(args[i]) && entry[args[i]];
    }, pieceOfState);
  };

  //Build the processing function that will be called when the `Promiese`
  //resolves.
  var processResults = (0, _results.buildProcessResultsFn)(resultsDescr, singleResult);

  var flush = function flush() {
    return {
      type: _actionConstants.FLUSH_ACTION,
      payload: {}
    };
  };

  var loadIfNeeded = function loadIfNeeded() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return function (dispatch, getState) {
      var state = extractState(getState());
      var resultsForQuery = state[queryName];

      if (!checkIfNeeded(resultsForQuery, args)) return;
      var params = buildParams(paramsDescr, args);
      dispatch({
        type: LOAD_ACTION,
        payload: { params: params }
      });

      var fetchQuery = fetchQueryHolder.fetchQuery;

      if (fetchQuery === undefined) throw new ReferenceError('Fetch query is undefined in `sparql-connect`; it probably has not ' + 'been set yet. Use the `setFetchQuery` function returned by ' + '`buildSparqlConnector` to set it.');

      if (typeof fetchQuery !== 'function') throw new TypeError('Expected `fetchQuery` to be a `function`, get a ' + '${typeof fetchQuery}`. Check what has been passed to ' + '`buildSparqlConnector` or to `setFetchQuery`');

      return fetchQuery(queryBuilder.apply(undefined, args)).then(function (rawResults) {
        var results = processResults(rawResults);
        dispatch({
          type: LOAD_SUCCESS_ACTION,
          payload: {
            params: params,
            results: results
          }
        });
      }).catch(function (error) {
        return dispatch({
          type: LOAD_FAILURE_ACTION,
          payload: {
            params: params,
            error: error
          }
        });
      });
    };
  };

  //We return `loadIfNeeded` that can be used by a react component, and the
  //action constants that can be used by a reducer.
  return {
    loadIfNeeded: loadIfNeeded,
    flush: flush,
    actions: {
      FLUSH_ACTION: _actionConstants.FLUSH_ACTION,
      LOAD_ACTION: LOAD_ACTION,
      LOAD_SUCCESS_ACTION: LOAD_SUCCESS_ACTION,
      LOAD_FAILURE_ACTION: LOAD_FAILURE_ACTION
    }
  };
}