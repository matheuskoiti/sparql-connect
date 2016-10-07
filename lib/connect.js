'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.buildConnect = buildConnect;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _stateUtils = require('./state-utils');

var _remoteConstants = require('./remote-constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function buildConnect(queryName, query, loadIfNeeded, flush, extractState) {

  // the local variable that holds the wrapped component must start with an
  // uppercase (ie  `function(myComponent)` won't work)
  // https://facebook.github.io/react/docs/jsx-in-depth.html
  var whatWeGet = query.whatWeGet;
  var params = query.params;
  var singleResult = query.singleResult;

  whatWeGet = whatWeGet || 'results';
  //TODO check if the use of `connect` here is ok (we might better build the
  //component outside, in order to avoid useless calls to `connect`:
  //`connect` produces a formal description, not a per-instance based function; in other
  //words, `connect` won't build `mapDispatchToProps` for each instance, but
  //only once for the component, and we should not lose this benefit).
  var propsToArgs = function propsToArgs(props) {
    return params.map(function (param) {
      return props[param.name];
    });
  };

  var sameArgsFromProps = function sameArgsFromProps(oldProps, newProps) {
    return params.every(function (param) {
      return oldProps[param.name] === newProps[param.name];
    });
  };

  return function sparqlConnect(WrappedComponent) {
    var Connect = function (_Component) {
      _inherits(Connect, _Component);

      function Connect() {
        _classCallCheck(this, Connect);

        return _possibleConstructorReturn(this, (Connect.__proto__ || Object.getPrototypeOf(Connect)).apply(this, arguments));
      }

      _createClass(Connect, [{
        key: 'componentWillMount',


        //when the component is mounted, load the query results if there
        //have not already been loaded
        value: function componentWillMount() {
          var _props;

          (_props = this.props).loadIfNeeded.apply(_props, _toConsumableArray(propsToArgs(this.props)));
        }

        //if the new props change the query parameters, load the query
        //results

      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var _props2;

          if (sameArgsFromProps(this.props, nextProps)) return;
          (_props2 = this.props).loadIfNeeded.apply(_props2, _toConsumableArray(propsToArgs(nextProps)));
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(WrappedComponent, this.props);
        }
      }]);

      return Connect;
    }(_react.Component);

    Connect.displayName = 'SparqlConnect(' + queryName + ')';
    Connect.propTypes = params.reduce(function (propTypes, param) {
      propTypes[param.name] = _react.PropTypes.string.isRequired;
      return propTypes;
    }, {});

    //We feed `WrappedComponent` with props related to the sparql query:
    //- loaded: LOADING, LOADED or FAILED ;
    //- if LOADED: [whatWeGet]: the results, we use the `whatWeGet` property for the
    //query documentation to expose the results with the right name (instead
    //of a generic name)
    //- if FAILED: error, the error message returned by the promise when
    //trying to load the results.
    var enhanceMSTP = function enhanceMSTP(state, ownProps) {
      var entry = (0, _stateUtils.getEntry)(extractState(state)[queryName], query.params, ownProps);
      //when the query does not take any parameter, status should be LOADING
      //by default
      //TODO improve status handling (LOADING doest not really mean loading, it
      //means "not failed or loaded")
      var loaded = entry ? entry.status || _remoteConstants.LOADING : _remoteConstants.LOADING;
      //success
      if (loaded === _remoteConstants.LOADED) {
        if (singleResult) return _extends({}, ownProps, {
          loaded: loaded
        }, entry.results);else return _extends({}, ownProps, _defineProperty({
          loaded: loaded
        }, whatWeGet, entry.results));
      }
      //failure
      if (loaded === _remoteConstants.FAILED) return _extends({}, ownProps, {
        loaded: loaded,
        error: entry.error
      });
      //loading
      return _extends({}, ownProps, {
        loaded: loaded
      });
      return ownProps;
    };

    var mapDispatchToProps = {
      loadIfNeeded: loadIfNeeded,
      flush: flush
    };

    return (0, _reactRedux.connect)(enhanceMSTP, mapDispatchToProps)(Connect);
  };
}