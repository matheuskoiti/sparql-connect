import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { getEntry } from './state-utils'
import { LOADING, LOADED, FAILED } from './remote-constants'

//queries is needed only for higher order queries, but required all the time
export function buildConnect(
    queryName, query, loadIfNeeded_, flush, extractState, queries) {
  
  // the local variable that holds the wrapped component must start with an
  // uppercase (ie  `function(myComponent)` won't work)
  // https://facebook.github.io/react/docs/jsx-in-depth.html
  let { params } = query
  
  //higher order querys combine multiple simple queries
  const simpleQuery = !query.queries
  
  //TODO `propsToArgs` should be included in `loadIfNeeded`
  const propsToArgsSimpleQuery = props => params.map(param => props[param.name])
  const propsToArgsHOQuery = props => {
    //TODO check that params match the list of simple queries combined
    //It should return something like
    ////`{
    // firstQuery: [firstParamForFirstQuery, ...],
    // secondQuery: [firstParamForSecondQuery, ...]
    //}`
    //`params` is an object, not an array, for higher order queries
    return query.queries.reduce((_, simpleQuery) => {
      const simpleQueryName = simpleQuery.name
      //FIXME
      // if (!simpleQuery) throw new Error(
      //   `Simple query \`${simpleQueryName}\` referenced by the higher ` +
      //   `order query \`${queryName}\` was not found.`
      // )
      _[simpleQueryName] = simpleQuery.params.map((param, i) =>
        props[params[simpleQueryName][i]])
      return _
    }, {})
  }
  
  const propsToArgs = simpleQuery ?
      propsToArgsSimpleQuery : propsToArgsHOQuery
  
  //`loadIfNeeded` for simple queries expects as many arguments as params. It
  //will be called with `propsToArgs` which returns an array for simple queries
  const buildLoadIfNeededSimpleQuery = dispatch => (...args) =>
    dispatch(loadIfNeeded_(...args))
  const buildLoadIfNeededHOQuery = dispatch => argsObj => {
    return Object.keys(loadIfNeeded_).forEach(simpleQueryName =>
      dispatch(loadIfNeeded_[simpleQueryName](...argsObj[simpleQueryName])))
  }
  
  const buildLoadIfNeeded = simpleQuery ?
    buildLoadIfNeededSimpleQuery : buildLoadIfNeededHOQuery
  
  const sameArgsFromPropsSimpleQuery = (oldProps, newProps) =>
    params.every(param => oldProps[param.name] === newProps[param.name])
    
  const sameArgsFromPropsHOQuery = (oldProps, newProps) =>
    console.error('FIXME')
  
  const sameArgsFromProps = simpleQuery ?
    sameArgsFromPropsSimpleQuery : sameArgsFromPropsHOQuery
    
  return function sparqlConnect(WrappedComponent) {
    //TODO check if the use of `connect` here is ok (we might better build the
    //component outside, in order to avoid useless calls to `connect`:
    //`connect` produces a formal description, not a per-instance based
    //function; in other words, `connect` won't build `mapDispatchToProps` for
    //each instance, but only once for the component, and we should not lose
    //this benefit).
    class Connect extends Component {
      
      constructor(props) {
        super(props)
        this.loadIfNeeded = buildLoadIfNeeded(this.props.dispatch)
      }
      //when the component is mounted, load the query results if there
      //have not already been loaded
      componentWillMount() {
        this.loadIfNeeded(propsToArgs(this.props))
      }
      
      //if the new props change the query parameters, load the query
      //results
      componentWillReceiveProps(nextProps) {
        if (sameArgsFromProps(this.props, nextProps)) return
        this.loadIfNeeded(propsToArgs(nextProps))
      }
      
      render() {
        return <WrappedComponent
          flush={() => this.props.dispatch(flush())}
          {...this.props} />
      }
    }
    
    Connect.displayName = `SparqlConnect(${queryName})`
    //TODO add proptypes for mulple queries
    // Connect.propTypes = params.reduce((propTypes, param) => {
    //   propTypes[param.name] = PropTypes.string.isRequired
    //   return propTypes
    // }, {})
    
    //We feed `WrappedComponent` with props related to the sparql query:
    //- loaded: LOADING, LOADED or FAILED ;
    //- if LOADED: [whatWeGet]: the results, we use the `whatWeGet` property for the
    //query documentation to expose the results with the right name (instead
    //of a generic name)
    //- if FAILED: error, the error message returned by the promise when
    //trying to load the results.
    const buildEnhanceMSTPSimpleQuery = (query, queryName) => {
      let { singleResult, whatWeGet } = query
      whatWeGet = whatWeGet || 'results'
      return (state, ownProps) => {
        const entry = getEntry(
          extractState(state)[queryName], query.params, ownProps)
        //when the query does not take any parameter, status should be LOADING
        //by default
        //TODO improve status handling (LOADING doest not really mean loading, it
        //means "not failed or loaded")
        const loaded = entry ? (entry.status || LOADING)  : LOADING
        //success
        if (loaded === LOADED) {
          if (singleResult) return {
            loaded,
            ...entry.results
          }
          else return {
            loaded,
            [whatWeGet]: entry.results
          }
        }
        //failure
        if (loaded === FAILED) return {
          loaded,
          error: entry.error
        }
        //loading
        return {
          loaded
        }
        return ownProps
      }
    }
      
    
    const enhanceMSTPSimpleQuery = buildEnhanceMSTPSimpleQuery(query, queryName)
    
    
    const buildEnhanceMSTPHOQuery = (query, name) => {
      let { whatWeGet } = query
      whatWeGet = whatWeGet || 'results'
      const enhanceSimpleQueries = query.queries.reduce(
        (_, simpleQuery) => {
          _[simpleQuery.name] = buildEnhanceMSTPSimpleQuery(
              queries[simpleQuery.name], simpleQuery.name)
          return _
        }
      , {})
      return (state, ownProps) => {
        let loaded = LOADED
        let error
        const simpleQueryResults =
          Object.keys(enhanceSimpleQueries).reduce(
            (_, simpleQueryName) => {
              const results =
                enhanceSimpleQueries[simpleQueryName](state, ownProps)
              if (results.loaded === LOADING && loaded !== FAILED) loaded = LOADING
              else if (results.loaded === FAILED) {
                error = results.error //TODO we only keep track of the last error
                loaded = FAILED
              }
              _[simpleQueryName] = results
              return _
          }, {})
        switch (loaded) {
          case LOADED:
            return {
              loaded,
              //TODO simplify, we might better not valued `whatWeGet` in the
              //first place for simple queries called in this context
              [whatWeGet]: Object.keys(simpleQueryResults).reduce(
                (_, simpleQueryName) => {
                  const simpleQuery = queries[simpleQueryName]
                  if (simpleQuery.singleResult) {
                    _[simpleQueryName] =
                      simpleQueryResults[simpleQueryName]
                  }
                  else {
                    const simpleWhatWeGet = simpleQuery.whatWeGet || 'results'
                    _[simpleQueryName] = simpleQueryResults[simpleQueryName][simpleWhatWeGet]
                  }
                  return _
                }
              , {})
            }
          case LOADING:
            return {
              loaded,
            }
          case FAILED: 
            return {
              loaded,
              error
            }
        }
        return {
          loaded,
          whatWeGet: simpleQueryResults
        }
      }
    }
    
    const enhanceMSTP = simpleQuery ? 
      buildEnhanceMSTPSimpleQuery(query, queryName) :
      buildEnhanceMSTPHOQuery(query, queryName) 
    
    return connect(enhanceMSTP)(Connect)
  }
}