'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getEntry = getEntry;
exports.pointToStateEntry = pointToStateEntry;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getEntry(state, paramsDescr, props) {
  switch (paramsDescr.length) {
    case 0:
      return state;
    case 1:
      return state[props[paramsDescr[0].name]];
    default:
      //TODO not implemented yet
      throw new Error('multiple parameters not implemented yet');
  }
}

function pointToStateEntry(paramsDescr, hndlrsMapping) {
  switch (paramsDescr.length) {
    case 0:
      return Object.keys(hndlrsMapping).reduce(function (builtMapping, actionType) {
        var hndlr = hndlrsMapping[actionType];
        builtMapping[actionType] = hndlr;
        return builtMapping;
      }, {});
    case 1:
      return Object.keys(hndlrsMapping).reduce(function (builtMapping, actionType) {
        var paramName = paramsDescr[0].name;
        var hndlr = hndlrsMapping[actionType];
        builtMapping[actionType] = function (state, payload) {
          var id = payload.params[paramName];
          var stateEntry = state[id];
          return _extends({}, state, _defineProperty({}, id, hndlr(stateEntry, payload)));
        };
        return builtMapping;
      }, {});
    default:
      return Object.keys(hndlrsMapping).reduce(function (builtMapping, actionType) {
        var paramName = paramsDescr[0].name;
        var hndlr = hndlrsMapping[actionType];
        // TODO implement
        builtMapping[actionType] = function (state, payload) {
          var id = payload.params[paramName];
          var stateEntry = state[id];
          return _extends({}, state, _defineProperty({}, id, hndlr(stateEntry, payload)));
        };
        return builtMapping;
      }, {});
  }
}