import { buildActionCreators } from './action-creators'
import { buildConnect } from './connect'
import { buildReducer } from './reducer'
import { LOADED, LOADING, FAILED } from './remote-constants'

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
  const extractState = sparqlName ? 
    state => state[sparqlName] : state => state
  //Allow setting of `fetchQuery` later, useful to bootsrap the application
  //before having the credentials
  const fetchHolder = { fetchQuery: fetchQuery }
  //exclude higher order queries for now
  const simpleQueries = Object.keys(queries).reduce((_, queryName) => {
    const query = queries[queryName]
    if (!query.queries) _[queryName] = query
    return _
  }, {})

  let globalFlush
  const { 
    reducers: sparqlReducers,
    connectFns: sparqlConnect,
    loadIfNeededFns
  } = Object.keys(simpleQueries).reduce(
      ({ reducers, connectFns, loadIfNeededFns }, queryName) => {
    const query = queries[queryName]
    const { loadIfNeeded, flush, actions } = 
      buildActionCreators(queryName, query, fetchHolder, extractState)
    globalFlush = flush //to use for higher order queries //TODO improve
    loadIfNeededFns[queryName] = loadIfNeeded
    reducers[queryName] = buildReducer(query, actions)
    connectFns[queryName] = 
      buildConnect(queryName, query, loadIfNeeded, flush, extractState)
    return { reducers, connectFns, loadIfNeededFns }
  }, { reducers: {}, connectFns: {}, loadIfNeededFns: {} })

  //add `connectFns` for higher order queries (no reducer for them)
  Object.keys(queries).forEach(queryName => {
    const query = queries[queryName]
    if (!query.queries) return //simple query, already processed
    //TODO `loadIfNeeded` is an object of functions here, but a function 
    //for simple query => improve api.
    const loadIfNeeded = query.queries.reduce((_, simpleQuery) => {
        _[simpleQuery.name] = loadIfNeededFns[simpleQuery.name]
        return _
      }, {})
    sparqlConnect[queryName] =
      buildConnect(queryName, query, loadIfNeeded, globalFlush, extractState, queries)
  })

  const _mainReducer = (state={}, action) => 
    Object.keys(sparqlReducers)
      .reduce((states, reducerId) => {
        states[reducerId] = 
          sparqlReducers[reducerId](state[reducerId], action)
        return states
      }, {})
  
   function _enhanceReducer(reducer) {
    return function enhancedWithSparqlReducer(state={}, action) {
      //we need to split the state in two parts: the part handled by the main
      //reducer and the part handled by the sparql reducer (under the
      //`results` entry if `sparqlName` was not provided). We could be tempted
      //to give the whole state to both reducers, but if the main reducer was
      //built with `combineReducers`, `redux` will complain about 'unexpected
      //keys' (not harmful but anyway).
      let { [sparqlName]: sparqlState, ...mainState } = state
      return {
        ...reducer(mainState, action),
        [sparqlName]: _mainReducer(sparqlState, action)
      }
    }
  }
  
  let mainReducer, enhanceReducer
  
  if (sparqlName) {
    enhanceReducer = _enhanceReducer
    mainReducer = (...args) => {
      console.warn(
        '`mainReducer` is not expected to be used as is because you ' + 
        '`sparqlName` as third argument of `buildSparqlConnector`. It ' +
        `means that results will stay under \`${sparqlName}\` in the state` 
      )
      return _mainReducer(...args)
    }
  }
  else {
    mainReducer = _mainReducer
    enhanceReducer = () => {
      throw new Error(
        'To use `enhanceReducer` you need to provide a `sparqlName` as third ' +
        'arugment of `buildSparqlConnector`. You should use `mainReducer` ' +
        'instead.'
      )
    }
  }
    
  return {
    mainReducer,
    sparqlConnect,
    enhanceReducer,
    setFetchQuery: fetchQuery => { fetchHolder.fetchQuery = fetchQuery }
  }
} 

export {
  buildSparqlConnector,
  // these constants will be imported by components
  LOADED,
  LOADING,
  FAILED
}
