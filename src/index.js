/**
 * Thin wrapper around `react-redux-resource` to connect `React` components to
 * `sparql` queries.
 */
import { buildResourceConnector, resourceCombine } from 'react-redux-resource';

import {
  buildFetchQuery,
  buildFetchQuerySmart,
  checkAuthentication as checkAuthenticationRaw,
  setPrefixes,
  setQueryURL
} from './remote';

const {
  resourceConnect,
  getReducer,
  flush,
  setFetchResource
} = buildResourceConnector();

function sparqlConnect(queryBuilder, config) {
  const { queryName, singleResult, whatWeGet, params } = config;
  let enhanceQueryBuilder;
  if (typeof queryBuilder === 'string')
    enhanceQueryBuilder = {
      query: queryBuilder,
      singleResult
    };
  else {
    // `queryBuilder` is a function
    enhanceQueryBuilder = (...args) => ({
      query: queryBuilder(...args),
      singleResult
    });
  }
  const configResource = {
    name: queryName,
    expand: singleResult,
    whatWeGet,
    params
  };
  return resourceConnect(enhanceQueryBuilder, configResource);
}

const sparqlCombine = resourceCombine;

let fetchQuery;
function getFetchQuery() {
  if (fetchQuery === undefined) {
    throw new Error(
      'An attempt to send a query to the server occured before the ' +
        'authentication succeeded.'
    );
  }
  return fetchQuery;
}

//authentication callback
function authenticationSuccess(token) {
  //build the fetch function used for updates query
  fetchQuery = buildFetchQuery(token);
  //build the fetch function used for select queries and register it with
  //`setFetchResource`
  setFetchResource(buildFetchQuerySmart(token));
}

function checkAuthentication(token) {
  return checkAuthenticationRaw(token).then(isAuth => {
    if (isAuth) authenticationSuccess(token);
    return isAuth;
  });
}

export {
  setQueryURL,
  setPrefixes,
  checkAuthentication,
  getReducer,
  sparqlConnect,
  sparqlCombine,
  flush,
  getFetchQuery
};
