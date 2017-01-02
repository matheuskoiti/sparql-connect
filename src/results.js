function buildProcessLine(vars) {
  return function processLine(line) {
    return (
      vars.reduce(function (rslts, rsltDescr) {
        var field = line[rsltDescr];
        //some optional variables might not be present in the line
        rslts[rsltDescr] = field !== undefined ? field.value : '';
        return rslts;
      }, {})
    )
  }
}

function buildProcessFn() {
  return function (rawResults) {
    //We will rely on `heads.var` returned by the server to process results
    var vars = rawResults.head.vars
    return rawResults.results.bindings.map(buildProcessLine(vars))
  }
}

function singleResultAjustments(results) {
  if (results.length === 1) return results[0];
  //If there is no result when a single result is expected, we throw an error.
  //The common use case for single results is when we try to show details for 
  //a selected object.
  if (results.length === 0)
    throw new Error('One result was expected but no result was found')
  throw new Error('Only one result expected, got ' + results.length);
}
/**
 * Build a function to process raw results returned by the server
 *
 * If `resultsDescr` is provided, it will rely on it to check the shape of the
 * results returned by the server and process them.
 *
 * If `singleResult` evaluates to `true`, one and only one row is expected in
 * the results, and an exception will be thrown otherwise.
 * 
 * @param  {Object}  resultsDescr describe expected results (one entry per
 *                                expected result)
 * @param  {Boolean} singleResult `true` if we expect the results to containe
 *                                one and only one line
 * @return {Function}             proccess the results
 */
export function buildProcessResults(singleResult) {
  var processFn = buildProcessFn();
  return singleResult ?
    //special adjustments for `singleResult` requests
     rawResults => singleResultAjustments(processFn(rawResults)) :
     processFn
}
