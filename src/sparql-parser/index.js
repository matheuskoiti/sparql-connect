import { Parser } from './sparql-parser';

const buildPrefix = (name, uri) => `PREFIX ${name}: <${uri}>`;

const parser = new Parser();

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
export function parse(query) {
  //reset Parser properties
  //we want all prefixes to be explicit in the request sent to the server.
  Parser.prefixes = {};
  Parser.missingPrefixes = [];
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
  const { missingPrefixes } = parse(query);

  if (missingPrefixes.length === 0) return query;
  const found = [], notFound = [];
  missingPrefixes.forEach(p => {
    knownPrefixes.hasOwnProperty(p)
      ? found.push([p, knownPrefixes[p]])
      : notFound.push(p);
  });
  if (notFound.length > 0)
    throw new Error(
      `Some prefixes (${notFound.join(',')}) are missing in \n\`${query}\``
    );
  //we add missing prefixes which are found in `prefixes.js`
  const buildQuery = found.map(([name, uri]) => buildPrefix(name, uri));
  buildQuery.push(query);
  return buildQuery.join('\n');
}

export function processQuery(query, prefixes) {
  //Safety check: if we don't set the query params properly, or if the
  //connected component does not receive the expected props, we might find
  //`undefined` somewhere in the query.
  if (query.includes('undefined'))
    console.warn(
      'One query refers to `undefied`, there might be an issue ' +
        'with query parameters configuration or with the component props. ' +
        `Query: \n${query}`
    );
  //we check the query syntax and add missing prefix that have been defined
  //locally
  let parsedQuery;
  try {
    parsedQuery = parseQuery(query, prefixes);
  } catch (err) {
    throw new Error(`Invalid query ${err} in ${query}`);
  }
  return parsedQuery;
}
