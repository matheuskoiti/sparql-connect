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

export function buildFetchQuery(queryURL, token) {
  const headers = {
    Accept: 'application/sparql-results+json',
    // We need to pass some `x-www-form-urlencoded` data.
    //`multipart/form-data` created with `new FormData()` does not work.
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  //Don't set `Authorisation` header if no token was provided. For instance,
  //dbpedia.org does not like it: Request header field authorization is not
  //allowed by Access-Control-Allow-Headers in preflight response.
  if (token) headers['Authorization'] = token;
  //`fetchQuery` is a function that takes a `sparql` query string, sends it to
  //the server and returns a promise that resolves to the query results
  // (https://www.w3.org/TR/sparql11-results-json/)
  return function fetchQuery(query) {
    return fetch(queryURL, {
      method: 'POST',
      headers,
      body: bodyFromSparql(processQuery(query, prefixes))
    });
  };
}

export function buildFetchQuerySmart(queryURL, token) {
  return function fetchQuerySmart({ query, singleResult }) {
    return buildFetchQuery(queryURL, token)(query)
      .then(res => res.json())
      .then(buildProcessResults(singleResult));
  };
}
