'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setQueryURL = exports.setPrefixes = undefined;
exports.checkAuthentication = checkAuthentication;
exports.buildFetchQuery = buildFetchQuery;
exports.buildFetchQuerySmart = buildFetchQuerySmart;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _results = require('./results');

var _index = require('./sparql-parser/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bodyFromSparql = function bodyFromSparql(query) {
  return 'query=' + encodeURIComponent(query);
};

//object with all known prefixes
//Stardog HTTP API documentation: http://docs.stardog.apiary.io/#
var prefixes = {
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#'
};
var setPrefixes = exports.setPrefixes = function setPrefixes(prefixDict) {
  return prefixes = prefixDict;
};

//sparql endpoint URL
var queryURL = void 0;
var setQueryURL = exports.setQueryURL = function setQueryURL(URL) {
  return queryURL = URL;
};

function checkAuthentication(token) {
  //This query is used to check if the server returns an authentication error
  var testQuery = 'SELECT ?s { ?s ?p ?o} LIMIT 1';
  var fetchQuery = buildFetchQuery(token);
  return fetchQuery(testQuery)
  //might need more fine grained control
  .then(function (res) {
    return res.ok;
  });
}

function buildFetchQuery(token) {
  if (queryURL === undefined) throw new Error('Attempting to send a query but the sparql endpoint URL has not been ' + 'set. Use `setQueryURL` to define this URL.');
  //`fetchQuery` is a function that takes a `sparql` query string, sends it to
  //the server and returns a promise that resolves to the query results
  // (https://www.w3.org/TR/sparql11-results-json/)
  return function fetchQuery(query) {
    return (0, _isomorphicFetch2.default)(queryURL, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': 'application/sparql-results+json',
        // We need to pass some `x-www-form-urlencoded` data. 
        //`multipart/form-data` created with `new FormData()` does not work.
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyFromSparql((0, _index.processQuery)(query, prefixes))
    });
  };
}

function buildFetchQuerySmart(token) {
  return function fetchQuerySmart(_ref) {
    var query = _ref.query,
        singleResult = _ref.singleResult;

    return buildFetchQuery(token)(query).then(function (res) {
      return res.json();
    }).then((0, _results.buildProcessResults)(singleResult));
  };
}