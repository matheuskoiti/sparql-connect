# sparql-connect

Provides utility functions to easily populate react components with sparql query results stored in a `redux` store.

This library eliminates boilerplate when dealing with components populated by sparql query results.

To populate a `react` component with the results of a `sparql` query `xyz`, this library generates: 
- action constants `LOAD_XYZ`, `LOAD_XYZ_SUCCESS`, `LOAD_XYZ_FAILURE` ;
- action creators:
 * `loadXyzIfNeeded` to check if there is already an entry for the query results in the dedicated reducer and call `loadXyz` if not;
 * `loadXyz` which handles the remote call;
 * `loadXyzSuccess` which processes the results; to process the results we need to look at the query to know what to expect;
 * `loadXyzFailure`;
- a reducer which handles the aforementioned actions by adding an entry for the query parameter;
- `mapStateToProps` to extract information from the reducer: did the request succeed and what are the results;
- a stateful component that will call `loadXyzIfNeeded` within the `componentWillMount` and `componentWillReceiveProps` lifecycle methods.

## Install

Install it directly from this gitHub repo:

```
npm install --save noknot/sparql-connect
```

## How to use it

### Configure `sparql-connect`

This step needs to be done once for the whole project:

```javascript
import { buildSparqlConnector } from 'sparql-connect'
/*
`queries` is an object of documented sparql queries (see below)

`fetchQuery` is a function that takes a `sparql` query string, sends it to the
server and returns a promise that resolves to the query results (
https://www.w3.org/TR/sparql11-results-json/)
*/

export const {
  sparqlConnect,
  enhanceReducer //mainReducer is another option,
  //setFetchQuery
} = buildSparqlConnector(
      queries, //documented queries
      buildFetch(queryURL, authorization), //it can be undefined
      'results' //where to find sparql results in the main state
    )
```

The second argument of `buildSparqlConnector` is a function which sends a query to the server and return a promise that resolve to the results of that query. If omitted, this function can be set later with `setFetchQuery` (this is useful for instance to bootstrap the application before having the credentials to the remote calls).

If the state does nothing more than the handling of sparql queries, we can use `mainReducer` in place of `enhanceReducer`. `mainReducer` will act as the main application reducer, where `enhanceReducer` is intended to be used to enhance an existing reducer (by adding an entry to the state to hold sparql results). To use `mainReducer`, do not provide any third argument to `buildSparqlConnector`: this third argument is intended to describe the name where to find sparql query results when we enhance an existing reducer.

### Add a new query builder

A query builder is a `function` which takes zero, one or multiple arguments and returns a string representing the query to send to the server. For instance:

```javascript
const levelItems = level => `
  PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX skos:<http://www.w3.org/2004/02/skos/core#>
  SELECT ?item ?code ?label WHERE {
    <${level}> skos:member ?item .
    ?item skos:notation ?code ; skos:prefLabel ?label .
  } ORDER BY ?code
`
(...)
export default {
  ...,
  levelItems
}
```

### Document the query 

A query documentation looks like this:

```javascript
export default {
  ...
  levelItems: {
    descr: 'Retrieve items with their details (code and label) for a given level',
    params: [{
      name: 'level',
      descr: 'level (uri)'
    }],
    whatWeGet: 'items', //optional: the component will receive `whatWeGet` in
                        //its props (defaults to `results`)
    results: {
      item: 'item (uri)', //this description is not valued for now, only the 
                          //keys are used to process the results returned by the
                          //server
      code: 'code of the item (string)',
      label: 'label of the item (string)'
    },
    queryBuilder: levelItems
  }
```
The `params` description is mandatory. It enables to map `props` to the
`queryBuilder` function arguments. In this case, `level` will have to be passed
as a prop to the component. If not, a `Failed prop type` error (`react`) will be
raised.

The `results` description is optional. If given, some checks will enable catching errors when the results do not comply to this description. If not given, results will be exposed to the component based on the variable names returned by the server (`head.vars`  array in the results).

All `descr` properties are optional.

### Build a component to visualize the query results

```javascript
function Items({ loaded, items }) {
  if (loaded !== LOADED) return <span>loading items</span>
  return (
    <ul>
      {items.map(({ item, code, label}) => <li key={item}>{item}</li>}
    </ul>
  )
}
```

`loaded` and `items` will be passed by the connector (see below). Each object in
`items` will have the properties mentioned in the query documentation: `item`,
`code`, `label`.

### Connect this component to the sparql query:
```
import { sparqlConnect } from '../sparql/configure-sparql'
(...)
//we use the name of the
export default sparqlConnect.levelItems(Items)
```

## Misc

### single result expected

The `singleResult` option in the query documentation is intended to make queries like "details for one item" more easy to process. If `singleResult` is set to `true` in the query documentation special rules apply when processing the results. We expect one and only one row in the results, so it will throw an error if there is no result or more than one row. Plus, results won't be exposed to the component as an array, but the results variables will be passed directly to the component. For instance, if the results description is :

```javascript
results: {
  code: 'classification code (integer)',
  label: 'classification label (string)',
  issued: 'issued'
}
```

We can write a component like this:
```javascript
function myComponent({ loaded, code, label, issued }) {...}
```
### reset the reducer

`sparql-connect` will return results from the application state if a query has already been submitted. But sometimes, we want the query to be sent to the server again (especially when we did an update). Each connected component can use the `flush` function passed as a prop to reset the reducer. Each query will need to be sent to the server since no results will be available from the reducers. For now, it resets all the reducers, in the future, we might want to make it configurable.

## TODO

1. Handle requests with multiple arguments: there's still some work to do to update the reducer (concatenating parameters might be an easier option than handling nested objects).
2. Handle optional variables. For now, when not present in the results, they are replaced by an empty string, but we might prefer to be able to specify a default value. Plus, sometimes variables that are not supposed to be optional are missing in the results, we should provide a way to throw errors in this situation.
