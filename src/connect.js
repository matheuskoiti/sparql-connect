import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { getEntry } from './state-utils'
import { LOADING, LOADED, FAILED } from './remote-constants'

export function buildConnect(queryName, query, loadIfNeeded, sparqlName) {

  // the local variable that holds the wrapped component must start with an
  // uppercase (ie  `function(myComponent)` won't work)
  // https://facebook.github.io/react/docs/jsx-in-depth.html
  let { whatWeGet, params, singleResult } = query
  whatWeGet = whatWeGet || 'results'
  //TODO check if the use of `connect` here is ok (we might better build the
  //component outside, in order to avoid useless calls to `connect`:
  //`connect` produces a formal description, not a per-instance based function; in other
  //words, `connect` won't build `mapDispatchToProps` for each instance, but
  //only once for the component, and we should not lose this benefit).
  const propsToArgs = props => params.map(param => props[param.name])
    
  const sameArgsFromProps = (oldProps, newProps) =>
    params.every(param =>oldProps[param.name] === newProps[param.name])
  
  return function sparqlConnect(WrappedComponent) {
    
    class Connect extends Component {
      
      //when the component is mounted, load the query results if there
      //have not already been loaded
      componentWillMount() {
        this.props.loadIfNeeded(...propsToArgs(this.props))
      }
      
      //if the new props change the query parameters, load the query
      //results
      componentWillReceiveProps(nextProps) {
        if (sameArgsFromProps(this.props, nextProps)) return
        this.props.loadIfNeeded(...propsToArgs(nextProps))
      }
      
      render() {
        return <WrappedComponent {...this.props} />
      }
    }
    
    Connect.displayName = `SparqlConnect(${queryName})`
    Connect.propTypes = params.reduce((propTypes, param) => {
      propTypes[param.name] = PropTypes.string.isRequired
      return propTypes
    }, {})
    
    //We feed `WrappedComponent` with props related to the sparql query:
    //- loaded: LOADING, LOADED or FAILED ;
    //- if LOADED: [whatWeGet]: the results, we use the `whatWeGet` property for the
    //query documentation to expose the results with the right name (instead
    //of a generic name)
    //- if FAILED: error, the error message returned by the promise when
    //trying to load the results.
    const enhanceMSTP = (state, ownProps) => {
      const entry = getEntry(state[sparqlName][queryName], query.params, ownProps)
      const loaded = entry ? entry.status  : LOADING
      //success
      if (loaded === LOADED) {
        if (singleResult) return {
          ...ownProps,
          loaded,
          ...entry.results
        }
        else return {
          ...ownProps,
          loaded,
          [whatWeGet]: entry.results
        }
      }
      //failure
      if (loaded === FAILED) return {
        ...ownProps,
        loaded,
        error: entry.error
      }
      //loading
      return {
        ...ownProps,
        loaded
      }
      return ownProps
    }
    
    const mapDispatchToProps = {
      loadIfNeeded
    }
    
    return connect(enhanceMSTP, mapDispatchToProps)(Connect)
  }
}