'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFetchQuery = exports.flush = exports.sparqlCombine = exports.sparqlConnect = exports.getReducer = exports.checkAuthentication = exports.setPrefixes = exports.setQueryURL = undefined;

var _reactReduxResource = require('react-redux-resource');

var _remote = require('./remote');

/**
 * Thin wrapper around `react-redux-resource` to connect `React` components to
 * `sparql` queries.
 */
var _buildResourceConnect = (0, _reactReduxResource.buildResourceConnector)(),
    resourceConnect = _buildResourceConnect.resourceConnect,
    getReducer = _buildResourceConnect.getReducer,
    flush = _buildResourceConnect.flush,
    setFetchResource = _buildResourceConnect.setFetchResource;

function sparqlConnect(queryBuilder, config) {
  var queryName = config.queryName,
      singleResult = config.singleResult,
      whatWeGet = config.whatWeGet,
      params = config.params;

  var enhanceQueryBuilder = void 0;
  if (typeof queryBuilder === 'string') enhanceQueryBuilder = {
    query: queryBuilder,
    singleResult: singleResult
  };
  // `queryBuilder` is a function
  else {
      enhanceQueryBuilder = function enhanceQueryBuilder() {
        return {
          query: queryBuilder.apply(undefined, arguments),
          singleResult: singleResult
        };
      };
    }
  var configResource = {
    name: queryName,
    expand: singleResult,
    whatWeGet: whatWeGet,
    params: params
  };
  return resourceConnect(enhanceQueryBuilder, configResource);
}

var sparqlCombine = _reactReduxResource.resourceCombine;

var fetchQuery = void 0;
function getFetchQuery() {
  if (fetchQuery === undefined) {
    throw new Error('An attempt to send a query to the server occured before the ' + 'authentication succeeded.');
  }
  return fetchQuery;
}

//authentication callback
function authenticationSuccess(token) {
  //build the fetch function used for updates query 
  fetchQuery = (0, _remote.buildFetchQuery)(token);
  //build the fetch function used for select queries and register it with
  //`setFetchResource`
  setFetchResource((0, _remote.buildFetchQuerySmart)(token));
}

function checkAuthentication(token) {
  return (0, _remote.checkAuthentication)(token).then(function (isAuth) {
    if (isAuth) authenticationSuccess(token);
    return isAuth;
  });
}

exports.setQueryURL = _remote.setQueryURL;
exports.setPrefixes = _remote.setPrefixes;
exports.checkAuthentication = checkAuthentication;
exports.getReducer = getReducer;
exports.sparqlConnect = sparqlConnect;
exports.sparqlCombine = sparqlCombine;
exports.flush = flush;
exports.getFetchQuery = getFetchQuery;