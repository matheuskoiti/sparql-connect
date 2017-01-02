# sparql-connect

`sparql-connect` allows to write `sparql` queries alongside `React` components in order to feed them with the query results.

It uses `redux` to store the status of each query and its results. Hence, a query will not be sent to the server if the results are available locally. It creates dedicated actions for each kind of query, so we can easily track the queries for debugging purpose (with `redux-devtools` for instance).

## Install

```
npm install --save sparql-connect
```

You will need `React` to write your components, `redux` to manage the state of your application, and `react-redux` to connect your components to the state. You should probably have them already installed, but if not you can install them with:

```
npm install --save react redux react-redux
```

## How to use it

For a complete guide, see [documentation](./doc/documentation.md).

```javascript
import { sparqlConnect, setQueryURL } from 'sparql-connect'

//Set the sparql endpoint (should be done once for the whole application)
setQueryURL('http://example.com/sparql')

//Write a query that returns some resources with the additional field `label`
const query = `
  SELECT ?resource ?label
  WHERE { ... } 
`
//Create a connector to populate the component with the results
const connector = sparqlConnect(query)

//Write your components assuming the query results will be available as a prop
//named `results`
function ResourcesList({ results }) {
  return (
    <ul>
      {
        results.map(({ resource, label }) => 
          <li key={resource}>{ label }</li>
        )
      }
    </ul>
  )
}

//Connect the query to your component
export default connector(ResourcesList)
```

## Sparql queries validation

This library uses [SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js) to check the query syntax and add some possible missing prefixes (more precisely, it uses the `jison` grammar from `SPARQL.js`).