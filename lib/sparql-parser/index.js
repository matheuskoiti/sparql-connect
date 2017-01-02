'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.parse = parse;
exports.processQuery = processQuery;

var _sparqlParser = require('./sparql-parser');

var buildPrefix = function buildPrefix(name, uri) {
  return 'PREFIX ' + name + ': <' + uri + '>';
};

var parser = new _sparqlParser.Parser();

/**
 * Parse a query and check its syntax, including missing prefixes
 *
 * It throws an error if it's not a valid sparql query. It returns an object
 * representing the query if the syntax is ok.
 *
 * Possible missing prefixes will be listed in `missingPrefixes` array
 *
 * @param  {string} query sparql query
 * @return {object}       javascript representation of the query
 */
function parse(query) {
  //reset Parser properties
  //we want all prefixes to be explicit in the request sent to the server.
  _sparqlParser.Parser.prefixes = {};
  _sparqlParser.Parser.missingPrefixes = [];
  return parser.parse(query);
}

/**
 * Parse a sparql query and try to fix missing prefixes
 *
 * If the query is valid, it returns the initial query.
 * If the syntax is correct but some prefixes are missing, it will try to fix
 * missing prefixes by looking up in `knownPrefixes`
 * If there's an issue with the syntax or if it was not able to fix missing
 * prefixes, it will throw an error.
 * 
 * @param  {string} query         sparql query
 * @param  {object} knownPrefixes an object with prefix as key and corresponding
 *                                url as value
 * @return {string}               sparql query
 */
function parseQuery(query, knownPrefixes) {
  //for missing prefixes that have been defined locally, we will add then
  //to the query
  var _parse = parse(query),
      missingPrefixes = _parse.missingPrefixes;

  if (missingPrefixes.length === 0) return query;
  var found = [],
      notFound = [];
  missingPrefixes.forEach(function (p) {
    knownPrefixes.hasOwnProperty(p) ? found.push([p, knownPrefixes[p]]) : notFound.push(p);
  });
  if (notFound.length > 0) throw new Error('Some prefixes (' + notFound.join(',') + ') are missing in \n`' + query + '`');
  //we add missing prefixes which are found in `prefixes.js`
  var buildQuery = found.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        name = _ref2[0],
        uri = _ref2[1];

    return buildPrefix(name, uri);
  });
  buildQuery.push(query);
  return buildQuery.join('\n');
}

function processQuery(query, prefixes) {
  //Safety check: if we don't set the query params properly, or if the
  //connected component does not receive the expected props, we might find
  //`undefined` somewhere in the query.
  if (query.includes('undefined')) console.warn('One query refers to `undefied`, there might be an issue ' + 'with query parameters configuration or with the component props. ' + ('Query: \n' + query));
  //we check the query syntax and add missing prefix that have been defined
  //locally
  var parsedQuery = void 0;
  try {
    parsedQuery = parseQuery(query, prefixes);
  } catch (err) {
    throw new Error('Invalid query ' + err + ' in ' + query);
  }
  return parsedQuery;
}