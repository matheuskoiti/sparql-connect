//Stardog HTTP API documentation: http://docs.stardog.apiary.io/#
import fetch from 'isomorphic-fetch';
import { buildProcessResults } from './results';
import { processQuery } from './sparql-parser/index';

const bodyFromSparql = query => `query=${encodeURIComponent(query)}`;

//object with all known prefixes
let prefixes = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#'
};
export const setPrefixes = prefixDict => (prefixes = prefixDict);

//sparql endpoint URL
let queryURL;
export const setQueryURL = URL => (queryURL = URL);

export function checkAuthentication(token) {
  //This query is used to check if the server returns an authentication error
  const testQuery = 'SELECT ?s { ?s ?p ?o} LIMIT 1';
  const fetchQuery = buildFetchQuery(token);
  return (
    fetchQuery(testQuery)
      //might need more fine grained control
      .then(res => res.ok)
  );
}

export function buildFetchQuery(token) {
  if (queryURL === undefined)
    throw new Error(
      'Attempting to send a query but the sparql endpoint URL has not been ' +
        'set. Use `setQueryURL` to define this URL.'
    );
  //`fetchQuery` is a function that takes a `sparql` query string, sends it to
  //the server and returns a promise that resolves to the query results
  // (https://www.w3.org/TR/sparql11-results-json/)
  return function fetchQuery(query) {
    return fetch(queryURL, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/sparql-results+json',
        // We need to pass some `x-www-form-urlencoded` data.
        //`multipart/form-data` created with `new FormData()` does not work.
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyFromSparql(processQuery(query, prefixes))
    });
  };
}

export function buildFetchQuerySmart(token) {
  return function fetchQuerySmart({ query, singleResult }) {
    return buildFetchQuery(token)(query)
      .then(res => res.json())
      .then(buildProcessResults(singleResult));
  };
}
