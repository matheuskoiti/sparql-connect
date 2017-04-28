import React from 'react';
import { sparqlConnect, setQueryURL } from 'sparql-connect';

//Set the sparql endpoint (should be done once for the whole application)
setQueryURL('http://dbpedia.org/sparql');

//Write a query that returns some resources with the additional field `label`
const query = `
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX dbo: <http://dbpedia.org/ontology/>
  PREFIX : <http://dbpedia.org/resource/>

  SELECT DISTINCT ?name ?person
  WHERE {      
    ?person dbo:birthPlace :Brussels .     
    ?person foaf:name ?name .
  }
  LIMIT 10
`;
//Create a connector to populate the component with the results
const connector = sparqlConnect(query, {
  queryName: 'people'
});

//Write your components assuming the query results will be available as a prop
//named `results`
function PersonList({ people }) {
  return (
    <ul>
      {people.map(({ name, person }) => <li key={person}>{name}</li>)}
    </ul>
  );
}

//Connect the query to your component
export default connector(PersonList);
