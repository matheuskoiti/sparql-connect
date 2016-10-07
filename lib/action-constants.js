'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var camelCaseRegExp = /([a-z])([A-Z])/g;

var creatorSuffixFromName = function creatorSuffixFromName(queryName) {
  return queryName.replace(camelCaseRegExp, '$1_$2').toUpperCase();
};

var FLUSH_ACTION = exports.FLUSH_ACTION = 'FLUSH';
var buildActionConstants = exports.buildActionConstants = function buildActionConstants(queryName) {
  var actionCreatorSuffix = creatorSuffixFromName(queryName);
  return {
    LOAD_ACTION: 'LOAD_' + actionCreatorSuffix,
    LOAD_SUCCESS_ACTION: 'LOAD_' + actionCreatorSuffix + '_SUCCESS',
    LOAD_FAILURE_ACTION: 'LOAD_' + actionCreatorSuffix + '_FAILURE'
  };
};