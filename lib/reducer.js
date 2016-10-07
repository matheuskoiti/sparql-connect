'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildReducer = buildReducer;

var _stateUtils = require('./state-utils');

var _remoteConstants = require('./remote-constants');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function loadHndlr(stateEntry, _ref) {
  var params = _ref.params;

  return {
    status: _remoteConstants.LOADING
  };
}

function loadSuccesHndlr(stateEntry, _ref2) {
  var params = _ref2.params;
  var results = _ref2.results;

  return {
    status: _remoteConstants.LOADED,
    results: results
  };
}

function loadFailureHndlr(stateEntry, _ref3) {
  var params = _ref3.params;
  var error = _ref3.error;

  return {
    status: _remoteConstants.FAILED,
    error: error
  };
}

function flushHndlr(state) {
  return {};
}

function buildReducer(query, actions) {
  var _pointToStateEntry;

  //`pointToStateEntry` allows to process only one entry from an immutable
  //collection and to replace it
  var hndlrs = (0, _stateUtils.pointToStateEntry)(query.params, (_pointToStateEntry = {}, _defineProperty(_pointToStateEntry, actions.LOAD_ACTION, loadHndlr), _defineProperty(_pointToStateEntry, actions.LOAD_SUCCESS_ACTION, loadSuccesHndlr), _defineProperty(_pointToStateEntry, actions.LOAD_FAILURE_ACTION, loadFailureHndlr), _pointToStateEntry));

  hndlrs[actions.FLUSH_ACTION] = flushHndlr;

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    var hndlr = hndlrs[action.type];
    return hndlr ? hndlr(state, action.payload) : state;
  };
}