(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["sparql-connect"] = factory();
	else
		root["sparql-connect"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getFetchQuery = exports.flush = exports.sparqlCombine = exports.sparqlConnect = exports.getReducer = exports.checkAuthentication = exports.setPrefixes = exports.setQueryURL = undefined;

	var _reactReduxResource = __webpack_require__(1);

	var _remote = __webpack_require__(71);

	/**
	 * Thin wrapper around `react-redux-resource` to connect `React` components to
	 * `sparql` queries.
	 */
	var _buildResourceConnect = (0, _reactReduxResource.buildResourceConnector)(),
	    resourceConnect = _buildResourceConnect.resourceConnect,
	    getReducer = _buildResourceConnect.getReducer,
	    flush = _buildResourceConnect.flush,
	    setFetchResource = _buildResourceConnect.setFetchResource;

	function sparqlConnect(queryBuilder, config) {
	  var queryName = config.queryName,
	      singleResult = config.singleResult,
	      whatWeGet = config.whatWeGet,
	      params = config.params;

	  var enhanceQueryBuilder = void 0;
	  if (typeof queryBuilder === 'string') enhanceQueryBuilder = {
	    query: queryBuilder,
	    singleResult: singleResult
	  };
	  // `queryBuilder` is a function
	  else {
	      enhanceQueryBuilder = function enhanceQueryBuilder() {
	        return {
	          query: queryBuilder.apply(undefined, arguments),
	          singleResult: singleResult
	        };
	      };
	    }
	  var configResource = {
	    name: queryName,
	    expand: singleResult,
	    whatWeGet: whatWeGet,
	    params: params
	  };
	  return resourceConnect(enhanceQueryBuilder, configResource);
	}

	var sparqlCombine = _reactReduxResource.resourceCombine;

	var fetchQuery = void 0;
	function getFetchQuery() {
	  if (fetchQuery === undefined) {
	    throw new Error('An attempt to send a query to the server occured before the ' + 'authentication succeeded.');
	  }
	  return fetchQuery;
	}

	//authentication callback
	function authenticationSuccess(token) {
	  //build the fetch function used for updates query 
	  fetchQuery = (0, _remote.buildFetchQuery)(token);
	  //build the fetch function used for select queries and register it with
	  //`setFetchResource`
	  setFetchResource((0, _remote.buildFetchQuerySmart)(token));
	}

	function checkAuthentication(token) {
	  return (0, _remote.checkAuthentication)(token).then(function (isAuth) {
	    if (isAuth) authenticationSuccess(token);
	    return isAuth;
	  });
	}

	exports.setQueryURL = _remote.setQueryURL;
	exports.setPrefixes = _remote.setPrefixes;
	exports.checkAuthentication = checkAuthentication;
	exports.getReducer = getReducer;
	exports.sparqlConnect = sparqlConnect;
	exports.sparqlCombine = sparqlCombine;
	exports.flush = flush;
	exports.getFetchQuery = getFetchQuery;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.buildResourceConnector = exports.setFetchResource = exports.resourceConnect = exports.resourceCombine = exports.setReducerKey = exports.getReducer = exports.flush = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _actionCreators = __webpack_require__(2);

	var _connect = __webpack_require__(4);

	var _reducer = __webpack_require__(69);

	var _combine = __webpack_require__(70);

	/**
	 * Build utility functions to connect components to async resources.
	 * 
	 * It returns:
	 * - `getReducer`: returns a reducer function based on the connectors that
	 * have been described so far;
	 * - `resourceConnect`: a function with takes a resource and some configuration
	 * and returns a connector. A connector is a function which takes a component
	 * and returns a component populated by the resource.
	 * - `setFetchResource`: a function to set the function that will be used to
	 * ask for the resource (remote call); this function is useful when we do not
	 * have a proper fetch function when we bootstrap the application (for instance
	 * if we need some credentials first).
	 * - `setReducerKey`: allow to set the reducer key afterwards (it's only needed
	 * to expose a default instance of `resources` to use with `combineReducer` and
	 * hide the call to `buildResourceConnector`).
	 *
	 * Connectors will add a prop with the resource (prop name depends on
	 * configuration) to the wrapped component.
	 *
	 * @param  {String} reducerKey     the key to access the reducer
	 * @param  {Object} fetchResource  sends the resource to the server and returns
	 *                                 a promise that resolves to the resource
	 * @return {Object}                utilities to connect to resources
	 */
	function buildResourceConnector(reducerKey, fetchResource) {
	  //Allow setting of `fetchResource` later, useful to bootsrap the application
	  //before having the credentials
	  function checkFetchResource(fn) {
	    if (typeof fn !== 'function') throw new TypeError('Expected `fetchResource` to be a `function`, get a ' + ('`' + (typeof fetchResource === 'undefined' ? 'undefined' : _typeof(fetchResource)) + '`. Check what has been passed to ') + '`buildresourceConnector` or to `setFetchResource`');
	  }
	  function setFetchResource(fn) {
	    checkFetchResource(fn);
	    fetchResource = fn;
	  }
	  function getFetchResource() {
	    if (fetchResource === undefined) throw new ReferenceError('Fetch resource is undefined in `react-redux-resource`; it probably has ' + 'not been set yet. Use the `setFetchResource` function returned by ' + '`buildresourceConnector` to set it.');
	    return fetchResource;
	  }
	  //It's probably only useful for users who want to combine the reducer with
	  //oher reducers without having to call `buildResourceConnector`. It makes
	  //first use of the library easier, since we can import `resourceConnect`
	  //directly from `react-redux-resource` (not from a configuration file).
	  function setReducerKey(key) {
	    if (reducerKey !== undefined) throw new Error('`reducerKey` cannot be set to `' + key + '`: it has already ' + ('been set to `' + reducerKey + '`.'));
	    reducerKey = key;
	  }
	  //delay resolution of `reducerKey` to give some to time for a possible used
	  //of`setReducerKey`
	  var getReducerKey = function getReducerKey() {
	    return reducerKey;
	  };
	  //Flag to catch attempts to add resources after the reducer has been built
	  var reducerHasBeenSet = false;
	  //`fetchResource` should be a function, but at initialization it can be
	  //undefined.
	  if (fetchResource !== undefined) checkFetchResource(fetchResource);

	  //we'll build an auto-incremented resource name when it is not defined
	  var resourceId = 0;

	  var actionRegister = (0, _actionCreators.buildActionRegister)();

	  function updateConfig(config) {
	    var name = config.name;
	    var whatWeGet = config.whatWeGet;
	    var params = config.params;
	    var expand = config.expand;
	    //`whatWeGet` defaults to the resource name, and to `resource` if no name
	    //was given

	    whatWeGet = whatWeGet || name || 'resource';
	    //if no `name` was given, we generate an incremental id
	    name = name || 'øRESOURCE_' + resourceId++ + 'ø';
	    //`params` is an array of strings (representing the names of the props the
	    //parent component will need to pass to the connected component)
	    //`params` can be missing if the `resource` function does not
	    //expect any arguments
	    params = params || [];
	    return {
	      name: name,
	      whatWeGet: whatWeGet,
	      params: params,
	      expand: Boolean(expand)
	    };
	  }

	  function resourceConnect(resource, config) {
	    //if `resource` is a string, we replace it with a function with no
	    //argument
	    if (typeof resource !== 'function') {
	      (function () {
	        var staticResource = resource;
	        resource = function resource() {
	          return staticResource;
	        };
	      })();
	    }
	    //use defaults when options are not set
	    config = updateConfig(config);
	    var _config = config;
	    var name = _config.name;


	    if (reducerHasBeenSet) throw new Error('The connector for resource `' + name + '` cannot be set. ' + 'The `reducer` has already been initialized and no resource can be ' + 'added at this time of the process.');
	    var actions = actionRegister.add(name);
	    return (0, _connect.buildConnect)(resource, config, actions, getFetchResource, getReducerKey);
	  }

	  return {
	    flush: _actionCreators.flush,
	    getReducer: function getReducer() {
	      reducerHasBeenSet = true;
	      return (0, _reducer.buildReducer)(actionRegister.getActions());
	    },
	    setReducerKey: setReducerKey,
	    resourceConnect: resourceConnect,
	    setFetchResource: setFetchResource
	  };
	}

	//Use a singleton pattern to facilitate the use of `react-redux-resource` from
	//the client app point of view. We still export `buildresourceConnector` to
	//allow advanced usages where we need more than one instance of
	//`react-redux-resource`.

	var _buildResourceConnect = buildResourceConnector();

	var getReducer = _buildResourceConnect.getReducer;
	var setReducerKey = _buildResourceConnect.setReducerKey;
	var resourceConnect = _buildResourceConnect.resourceConnect;
	var setFetchResource = _buildResourceConnect.setFetchResource;
	exports.flush = _actionCreators.flush;
	exports.getReducer = getReducer;
	exports.setReducerKey = setReducerKey;
	exports.resourceCombine = _combine.resourceCombine;
	exports.resourceConnect = resourceConnect;
	exports.setFetchResource = setFetchResource;
	exports.buildResourceConnector = buildResourceConnector;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.flush = exports.buildActionConstants = undefined;
	exports.buildActionRegister = buildActionRegister;

	var _actionConstants = __webpack_require__(3);

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var camelCaseRegExp = /([a-z])([A-Z])/g;
	var creatorSuffixFromName = function creatorSuffixFromName(name) {
	  return name.replace(camelCaseRegExp, '$1_$2').toUpperCase();
	};

	var buildActionConstants = exports.buildActionConstants = function buildActionConstants(name) {
	  var actionCreatorSuffix = creatorSuffixFromName(name);
	  return {
	    LOAD_ACTION: 'LOAD_' + actionCreatorSuffix,
	    LOAD_SUCCESS_ACTION: 'LOAD_' + actionCreatorSuffix + '_SUCCESS',
	    LOAD_FAILURE_ACTION: 'LOAD_' + actionCreatorSuffix + '_FAILURE'
	  };
	};

	var flush = exports.flush = function flush() {
	  return {
	    type: _actionConstants.FLUSH,
	    payload: {}
	  };
	};

	function buildActionRegister() {
	  var allActions = {};

	  //We return `loadIfNeeded` that can be used by a react component and we
	  //update the variable `allActions` which holds information about
	  //each action and the related resource.

	  function add(name) {
	    var _actionDescrs, _actions;

	    var _buildActionConstants = buildActionConstants(name);

	    var LOAD_ACTION = _buildActionConstants.LOAD_ACTION;
	    var LOAD_SUCCESS_ACTION = _buildActionConstants.LOAD_SUCCESS_ACTION;
	    var LOAD_FAILURE_ACTION = _buildActionConstants.LOAD_FAILURE_ACTION;


	    var actionDescrs = (_actionDescrs = {}, _defineProperty(_actionDescrs, LOAD_ACTION, {
	      name: name,
	      loadAction: _actionConstants.LOAD
	    }), _defineProperty(_actionDescrs, LOAD_SUCCESS_ACTION, {
	      name: name,
	      loadAction: _actionConstants.LOAD_SUCCESS
	    }), _defineProperty(_actionDescrs, LOAD_FAILURE_ACTION, {
	      name: name,
	      loadAction: _actionConstants.LOAD_FAILURE
	    }), _actionDescrs);

	    var actions = (_actions = {}, _defineProperty(_actions, _actionConstants.LOAD, LOAD_ACTION), _defineProperty(_actions, _actionConstants.LOAD_SUCCESS, LOAD_SUCCESS_ACTION), _defineProperty(_actions, _actionConstants.LOAD_FAILURE, LOAD_FAILURE_ACTION), _actions);
	    //update mappings beween actions and resource names 
	    Object.keys(actionDescrs).forEach(function (actionName) {
	      allActions[actionName] = actionDescrs[actionName];
	    });

	    return actions;
	  }

	  return {
	    add: add,
	    getActions: function getActions() {
	      return allActions;
	    }
	  };
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	//TODO prefix with something to avoid collision with ohter actions that would
	//be defined in the application using `react-async-connect`
	var LOAD = exports.LOAD = 'LOAD';
	var LOAD_SUCCESS = exports.LOAD_SUCCESS = 'LOAD_SUCCESS';
	var LOAD_FAILURE = exports.LOAD_FAILURE = 'LOAD_FAILURE';
	var FLUSH = exports.FLUSH = 'FLUSH';

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.buildConnect = buildConnect;
	exports.buildResourceConnect = buildResourceConnect;

	var _react = __webpack_require__(5);

	var _react2 = _interopRequireDefault(_react);

	var _reactRedux = __webpack_require__(36);

	var _loadIfNeeded = __webpack_require__(66);

	var _remoteConstants = __webpack_require__(67);

	var _stateUtils = __webpack_require__(68);

	var _actionCreators = __webpack_require__(2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function defaultError(_ref) {
	  var error = _ref.error;

	  return _react2.default.createElement(
	    'span',
	    null,
	    error
	  );
	}
	defaultError.propTypes = {
	  error: _react.PropTypes.string.isRequired
	};

	function defaultLoading() {
	  return _react2.default.createElement(
	    'span',
	    null,
	    'Results are loading...'
	  );
	}

	function buildConnect(resource, config, actions, getFetch, getReducerKey) {

	  var loadIfNeeded = (0, _loadIfNeeded.buildLoadIfNeeded)(getFetch, actions);

	  var name = config.name;
	  var expand = config.expand;
	  var whatWeGet = config.whatWeGet;

	  var mapStateToProps = (0, _stateUtils.buildMapStateToProps)(resource, config, getReducerKey);

	  function exposeResults(resourceConnect) {
	    if (expand) {
	      return resourceConnect.results;
	    } else {
	      return _defineProperty({}, whatWeGet, resourceConnect.results);
	    }
	  }
	  return buildResourceConnect(name, loadIfNeeded, exposeResults, mapStateToProps);
	}

	function buildResourceConnect(name, loadIfNeeded, exposeResults, mapStateToProps) {
	  //the local variable that holds the wrapped component must start with an
	  //uppercase (ie  `function(myComponent)` won't work)
	  //https://facebook.github.io/react/docs/jsx-in-depth.html
	  function resourceConnect(WrappedComponent) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    //TODO check if the use of `connect` here is ok (we might better build the
	    //component outside, in order to avoid useless calls to `connect`:
	    //`connect` produces a formal description, not a per-instance based
	    //function; in other words, `connect` won't build `mapDispatchToProps` for
	    //each instance, but only once for the component, and we should not lose
	    //this benefit).
	    var ErrorCmpnt = options.error || defaultError;
	    var LoadingCmpnt = options.loading || defaultLoading;

	    var Connect = function (_Component) {
	      _inherits(Connect, _Component);

	      function Connect(props) {
	        _classCallCheck(this, Connect);

	        //`args` should be made of only one argument, the `props`, but we wrap
	        //it in a more generic way
	        //`loadIfNeeded` takes `dispatch` as first argument (instead of a more
	        //conventional `dispatch(loadfIfNeeded(...)))` to work with multiple
	        //resources where we want to dispatch multiple actions.
	        var _this = _possibleConstructorReturn(this, (Connect.__proto__ || Object.getPrototypeOf(Connect)).call(this, props));

	        _this.loadIfNeeded = function (resourceConnect) {
	          return loadIfNeeded(props.dispatch, resourceConnect);
	        };
	        return _this;
	      }
	      //when the component is mounted, load the resource results if they
	      //have not been loaded yet


	      _createClass(Connect, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	          this.loadIfNeeded(this.props.resourceConnect);
	        }

	        //load the resource results if they have not been loaded yet

	      }, {
	        key: 'componentWillReceiveProps',
	        value: function componentWillReceiveProps(nextProps) {
	          this.loadIfNeeded(nextProps.resourceConnect);
	        }
	      }, {
	        key: 'render',
	        value: function render() {
	          var _this2 = this;

	          var _props = this.props;
	          var resourceConnect = _props.resourceConnect;

	          var otherProps = _objectWithoutProperties(_props, ['resourceConnect']);

	          var status = resourceConnect.status;
	          //When the LOAD action is dispatch by `loadIfNeeded`, `status` has not
	          //been set yet

	          if (status === undefined || status === _remoteConstants.LOADING) return _react2.default.createElement(LoadingCmpnt, this.props);
	          if (status === _remoteConstants.FAILED) return _react2.default.createElement(ErrorCmpnt, _extends({}, this.props, { error: resourceConnect.error }));

	          return _react2.default.createElement(WrappedComponent, _extends({
	            flush: function flush() {
	              return _this2.props.dispatch((0, _actionCreators.flush)());
	            }
	          }, otherProps, exposeResults(resourceConnect)));
	        }
	      }]);

	      return Connect;
	    }(_react.Component);

	    Connect.displayName = 'resourceConnect(' + name + ')';
	    //TODO add proptypes
	    return (0, _reactRedux.connect)(mapStateToProps)(Connect);
	  }
	  //we keep track of some functions for `resourceCombine`
	  resourceConnect.loadIfNeeded = loadIfNeeded;
	  resourceConnect.mapStateToProps = mapStateToProps;
	  resourceConnect.exposeResults = exposeResults;
	  return resourceConnect;
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(6);


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var _assign = __webpack_require__(8);

	var ReactChildren = __webpack_require__(9);
	var ReactComponent = __webpack_require__(22);
	var ReactPureComponent = __webpack_require__(25);
	var ReactClass = __webpack_require__(26);
	var ReactDOMFactories = __webpack_require__(28);
	var ReactElement = __webpack_require__(13);
	var ReactPropTypes = __webpack_require__(33);
	var ReactVersion = __webpack_require__(34);

	var onlyChild = __webpack_require__(35);
	var warning = __webpack_require__(15);

	var createElement = ReactElement.createElement;
	var createFactory = ReactElement.createFactory;
	var cloneElement = ReactElement.cloneElement;

	if (process.env.NODE_ENV !== 'production') {
	  var ReactElementValidator = __webpack_require__(29);
	  createElement = ReactElementValidator.createElement;
	  createFactory = ReactElementValidator.createFactory;
	  cloneElement = ReactElementValidator.cloneElement;
	}

	var __spread = _assign;

	if (process.env.NODE_ENV !== 'production') {
	  var warned = false;
	  __spread = function () {
	    process.env.NODE_ENV !== 'production' ? warning(warned, 'React.__spread is deprecated and should not be used. Use ' + 'Object.assign directly or another helper function with similar ' + 'semantics. You may be seeing this warning due to your compiler. ' + 'See https://fb.me/react-spread-deprecation for more details.') : void 0;
	    warned = true;
	    return _assign.apply(null, arguments);
	  };
	}

	var React = {

	  // Modern

	  Children: {
	    map: ReactChildren.map,
	    forEach: ReactChildren.forEach,
	    count: ReactChildren.count,
	    toArray: ReactChildren.toArray,
	    only: onlyChild
	  },

	  Component: ReactComponent,
	  PureComponent: ReactPureComponent,

	  createElement: createElement,
	  cloneElement: cloneElement,
	  isValidElement: ReactElement.isValidElement,

	  // Classic

	  PropTypes: ReactPropTypes,
	  createClass: ReactClass.createClass,
	  createFactory: createFactory,
	  createMixin: function (mixin) {
	    // Currently a noop. Will be used to validate and trace mixins.
	    return mixin;
	  },

	  // This looks DOM specific but these are actually isomorphic helpers
	  // since they are just generating DOM strings.
	  DOM: ReactDOMFactories,

	  version: ReactVersion,

	  // Deprecated hook for JSX spread, don't use this for anything.
	  __spread: __spread
	};

	module.exports = React;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 7 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	/* eslint-disable no-unused-vars */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (e) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var PooledClass = __webpack_require__(10);
	var ReactElement = __webpack_require__(13);

	var emptyFunction = __webpack_require__(16);
	var traverseAllChildren = __webpack_require__(19);

	var twoArgumentPooler = PooledClass.twoArgumentPooler;
	var fourArgumentPooler = PooledClass.fourArgumentPooler;

	var userProvidedKeyEscapeRegex = /\/+/g;
	function escapeUserProvidedKey(text) {
	  return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
	}

	/**
	 * PooledClass representing the bookkeeping associated with performing a child
	 * traversal. Allows avoiding binding callbacks.
	 *
	 * @constructor ForEachBookKeeping
	 * @param {!function} forEachFunction Function to perform traversal with.
	 * @param {?*} forEachContext Context to perform context with.
	 */
	function ForEachBookKeeping(forEachFunction, forEachContext) {
	  this.func = forEachFunction;
	  this.context = forEachContext;
	  this.count = 0;
	}
	ForEachBookKeeping.prototype.destructor = function () {
	  this.func = null;
	  this.context = null;
	  this.count = 0;
	};
	PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

	function forEachSingleChild(bookKeeping, child, name) {
	  var func = bookKeeping.func,
	      context = bookKeeping.context;

	  func.call(context, child, bookKeeping.count++);
	}

	/**
	 * Iterates through children that are typically specified as `props.children`.
	 *
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.foreach
	 *
	 * The provided forEachFunc(child, index) will be called for each
	 * leaf child.
	 *
	 * @param {?*} children Children tree container.
	 * @param {function(*, int)} forEachFunc
	 * @param {*} forEachContext Context for forEachContext.
	 */
	function forEachChildren(children, forEachFunc, forEachContext) {
	  if (children == null) {
	    return children;
	  }
	  var traverseContext = ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
	  traverseAllChildren(children, forEachSingleChild, traverseContext);
	  ForEachBookKeeping.release(traverseContext);
	}

	/**
	 * PooledClass representing the bookkeeping associated with performing a child
	 * mapping. Allows avoiding binding callbacks.
	 *
	 * @constructor MapBookKeeping
	 * @param {!*} mapResult Object containing the ordered map of results.
	 * @param {!function} mapFunction Function to perform mapping with.
	 * @param {?*} mapContext Context to perform mapping with.
	 */
	function MapBookKeeping(mapResult, keyPrefix, mapFunction, mapContext) {
	  this.result = mapResult;
	  this.keyPrefix = keyPrefix;
	  this.func = mapFunction;
	  this.context = mapContext;
	  this.count = 0;
	}
	MapBookKeeping.prototype.destructor = function () {
	  this.result = null;
	  this.keyPrefix = null;
	  this.func = null;
	  this.context = null;
	  this.count = 0;
	};
	PooledClass.addPoolingTo(MapBookKeeping, fourArgumentPooler);

	function mapSingleChildIntoContext(bookKeeping, child, childKey) {
	  var result = bookKeeping.result,
	      keyPrefix = bookKeeping.keyPrefix,
	      func = bookKeeping.func,
	      context = bookKeeping.context;


	  var mappedChild = func.call(context, child, bookKeeping.count++);
	  if (Array.isArray(mappedChild)) {
	    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
	  } else if (mappedChild != null) {
	    if (ReactElement.isValidElement(mappedChild)) {
	      mappedChild = ReactElement.cloneAndReplaceKey(mappedChild,
	      // Keep both the (mapped) and old keys if they differ, just as
	      // traverseAllChildren used to do for objects as children
	      keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + '/' : '') + childKey);
	    }
	    result.push(mappedChild);
	  }
	}

	function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
	  var escapedPrefix = '';
	  if (prefix != null) {
	    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
	  }
	  var traverseContext = MapBookKeeping.getPooled(array, escapedPrefix, func, context);
	  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
	  MapBookKeeping.release(traverseContext);
	}

	/**
	 * Maps children that are typically specified as `props.children`.
	 *
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.map
	 *
	 * The provided mapFunction(child, key, index) will be called for each
	 * leaf child.
	 *
	 * @param {?*} children Children tree container.
	 * @param {function(*, int)} func The map function.
	 * @param {*} context Context for mapFunction.
	 * @return {object} Object containing the ordered map of results.
	 */
	function mapChildren(children, func, context) {
	  if (children == null) {
	    return children;
	  }
	  var result = [];
	  mapIntoWithKeyPrefixInternal(children, result, null, func, context);
	  return result;
	}

	function forEachSingleChildDummy(traverseContext, child, name) {
	  return null;
	}

	/**
	 * Count the number of children that are typically specified as
	 * `props.children`.
	 *
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.count
	 *
	 * @param {?*} children Children tree container.
	 * @return {number} The number of children.
	 */
	function countChildren(children, context) {
	  return traverseAllChildren(children, forEachSingleChildDummy, null);
	}

	/**
	 * Flatten a children object (typically specified as `props.children`) and
	 * return an array with appropriately re-keyed children.
	 *
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.toarray
	 */
	function toArray(children) {
	  var result = [];
	  mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
	  return result;
	}

	var ReactChildren = {
	  forEach: forEachChildren,
	  map: mapChildren,
	  mapIntoWithKeyPrefixInternal: mapIntoWithKeyPrefixInternal,
	  count: countChildren,
	  toArray: toArray
	};

	module.exports = ReactChildren;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var _prodInvariant = __webpack_require__(11);

	var invariant = __webpack_require__(12);

	/**
	 * Static poolers. Several custom versions for each potential number of
	 * arguments. A completely generic pooler is easy to implement, but would
	 * require accessing the `arguments` object. In each of these, `this` refers to
	 * the Class itself, not an instance. If any others are needed, simply add them
	 * here, or in their own files.
	 */
	var oneArgumentPooler = function (copyFieldsFrom) {
	  var Klass = this;
	  if (Klass.instancePool.length) {
	    var instance = Klass.instancePool.pop();
	    Klass.call(instance, copyFieldsFrom);
	    return instance;
	  } else {
	    return new Klass(copyFieldsFrom);
	  }
	};

	var twoArgumentPooler = function (a1, a2) {
	  var Klass = this;
	  if (Klass.instancePool.length) {
	    var instance = Klass.instancePool.pop();
	    Klass.call(instance, a1, a2);
	    return instance;
	  } else {
	    return new Klass(a1, a2);
	  }
	};

	var threeArgumentPooler = function (a1, a2, a3) {
	  var Klass = this;
	  if (Klass.instancePool.length) {
	    var instance = Klass.instancePool.pop();
	    Klass.call(instance, a1, a2, a3);
	    return instance;
	  } else {
	    return new Klass(a1, a2, a3);
	  }
	};

	var fourArgumentPooler = function (a1, a2, a3, a4) {
	  var Klass = this;
	  if (Klass.instancePool.length) {
	    var instance = Klass.instancePool.pop();
	    Klass.call(instance, a1, a2, a3, a4);
	    return instance;
	  } else {
	    return new Klass(a1, a2, a3, a4);
	  }
	};

	var standardReleaser = function (instance) {
	  var Klass = this;
	  !(instance instanceof Klass) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Trying to release an instance into a pool of a different type.') : _prodInvariant('25') : void 0;
	  instance.destructor();
	  if (Klass.instancePool.length < Klass.poolSize) {
	    Klass.instancePool.push(instance);
	  }
	};

	var DEFAULT_POOL_SIZE = 10;
	var DEFAULT_POOLER = oneArgumentPooler;

	/**
	 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
	 * itself (statically) not adding any prototypical fields. Any CopyConstructor
	 * you give this may have a `poolSize` property, and will look for a
	 * prototypical `destructor` on instances.
	 *
	 * @param {Function} CopyConstructor Constructor that can be used to reset.
	 * @param {Function} pooler Customizable pooler.
	 */
	var addPoolingTo = function (CopyConstructor, pooler) {
	  // Casting as any so that flow ignores the actual implementation and trusts
	  // it to match the type we declared
	  var NewKlass = CopyConstructor;
	  NewKlass.instancePool = [];
	  NewKlass.getPooled = pooler || DEFAULT_POOLER;
	  if (!NewKlass.poolSize) {
	    NewKlass.poolSize = DEFAULT_POOL_SIZE;
	  }
	  NewKlass.release = standardReleaser;
	  return NewKlass;
	};

	var PooledClass = {
	  addPoolingTo: addPoolingTo,
	  oneArgumentPooler: oneArgumentPooler,
	  twoArgumentPooler: twoArgumentPooler,
	  threeArgumentPooler: threeArgumentPooler,
	  fourArgumentPooler: fourArgumentPooler
	};

	module.exports = PooledClass;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	/**
	 * WARNING: DO NOT manually require this module.
	 * This is a replacement for `invariant(...)` used by the error code system
	 * and will _only_ be required by the corresponding babel pass.
	 * It always throws.
	 */

	function reactProdInvariant(code) {
	  var argCount = arguments.length - 1;

	  var message = 'Minified React error #' + code + '; visit ' + 'http://facebook.github.io/react/docs/error-decoder.html?invariant=' + code;

	  for (var argIdx = 0; argIdx < argCount; argIdx++) {
	    message += '&args[]=' + encodeURIComponent(arguments[argIdx + 1]);
	  }

	  message += ' for the full message or use the non-minified dev environment' + ' for full errors and additional helpful warnings.';

	  var error = new Error(message);
	  error.name = 'Invariant Violation';
	  error.framesToPop = 1; // we don't care about reactProdInvariant's own frame

	  throw error;
	}

	module.exports = reactProdInvariant;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var validateFormat = function validateFormat(format) {};

	if (process.env.NODE_ENV !== 'production') {
	  validateFormat = function validateFormat(format) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  };
	}

	function invariant(condition, format, a, b, c, d, e, f) {
	  validateFormat(format);

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	}

	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2014-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var _assign = __webpack_require__(8);

	var ReactCurrentOwner = __webpack_require__(14);

	var warning = __webpack_require__(15);
	var canDefineProperty = __webpack_require__(17);
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var REACT_ELEMENT_TYPE = __webpack_require__(18);

	var RESERVED_PROPS = {
	  key: true,
	  ref: true,
	  __self: true,
	  __source: true
	};

	var specialPropKeyWarningShown, specialPropRefWarningShown;

	function hasValidRef(config) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (hasOwnProperty.call(config, 'ref')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }
	  return config.ref !== undefined;
	}

	function hasValidKey(config) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (hasOwnProperty.call(config, 'key')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }
	  return config.key !== undefined;
	}

	function defineKeyPropWarningGetter(props, displayName) {
	  var warnAboutAccessingKey = function () {
	    if (!specialPropKeyWarningShown) {
	      specialPropKeyWarningShown = true;
	      process.env.NODE_ENV !== 'production' ? warning(false, '%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName) : void 0;
	    }
	  };
	  warnAboutAccessingKey.isReactWarning = true;
	  Object.defineProperty(props, 'key', {
	    get: warnAboutAccessingKey,
	    configurable: true
	  });
	}

	function defineRefPropWarningGetter(props, displayName) {
	  var warnAboutAccessingRef = function () {
	    if (!specialPropRefWarningShown) {
	      specialPropRefWarningShown = true;
	      process.env.NODE_ENV !== 'production' ? warning(false, '%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName) : void 0;
	    }
	  };
	  warnAboutAccessingRef.isReactWarning = true;
	  Object.defineProperty(props, 'ref', {
	    get: warnAboutAccessingRef,
	    configurable: true
	  });
	}

	/**
	 * Factory method to create a new React element. This no longer adheres to
	 * the class pattern, so do not use new to call it. Also, no instanceof check
	 * will work. Instead test $$typeof field against Symbol.for('react.element') to check
	 * if something is a React Element.
	 *
	 * @param {*} type
	 * @param {*} key
	 * @param {string|object} ref
	 * @param {*} self A *temporary* helper to detect places where `this` is
	 * different from the `owner` when React.createElement is called, so that we
	 * can warn. We want to get rid of owner and replace string `ref`s with arrow
	 * functions, and as long as `this` and owner are the same, there will be no
	 * change in behavior.
	 * @param {*} source An annotation object (added by a transpiler or otherwise)
	 * indicating filename, line number, and/or other information.
	 * @param {*} owner
	 * @param {*} props
	 * @internal
	 */
	var ReactElement = function (type, key, ref, self, source, owner, props) {
	  var element = {
	    // This tag allow us to uniquely identify this as a React Element
	    $$typeof: REACT_ELEMENT_TYPE,

	    // Built-in properties that belong on the element
	    type: type,
	    key: key,
	    ref: ref,
	    props: props,

	    // Record the component responsible for creating this element.
	    _owner: owner
	  };

	  if (process.env.NODE_ENV !== 'production') {
	    // The validation flag is currently mutative. We put it on
	    // an external backing store so that we can freeze the whole object.
	    // This can be replaced with a WeakMap once they are implemented in
	    // commonly used development environments.
	    element._store = {};

	    // To make comparing ReactElements easier for testing purposes, we make
	    // the validation flag non-enumerable (where possible, which should
	    // include every environment we run tests in), so the test framework
	    // ignores it.
	    if (canDefineProperty) {
	      Object.defineProperty(element._store, 'validated', {
	        configurable: false,
	        enumerable: false,
	        writable: true,
	        value: false
	      });
	      // self and source are DEV only properties.
	      Object.defineProperty(element, '_self', {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: self
	      });
	      // Two elements created in two different places should be considered
	      // equal for testing purposes and therefore we hide it from enumeration.
	      Object.defineProperty(element, '_source', {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: source
	      });
	    } else {
	      element._store.validated = false;
	      element._self = self;
	      element._source = source;
	    }
	    if (Object.freeze) {
	      Object.freeze(element.props);
	      Object.freeze(element);
	    }
	  }

	  return element;
	};

	/**
	 * Create and return a new ReactElement of the given type.
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.createelement
	 */
	ReactElement.createElement = function (type, config, children) {
	  var propName;

	  // Reserved names are extracted
	  var props = {};

	  var key = null;
	  var ref = null;
	  var self = null;
	  var source = null;

	  if (config != null) {
	    if (hasValidRef(config)) {
	      ref = config.ref;
	    }
	    if (hasValidKey(config)) {
	      key = '' + config.key;
	    }

	    self = config.__self === undefined ? null : config.__self;
	    source = config.__source === undefined ? null : config.__source;
	    // Remaining properties are added to a new props object
	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        props[propName] = config[propName];
	      }
	    }
	  }

	  // Children can be more than one argument, and those are transferred onto
	  // the newly allocated props object.
	  var childrenLength = arguments.length - 2;
	  if (childrenLength === 1) {
	    props.children = children;
	  } else if (childrenLength > 1) {
	    var childArray = Array(childrenLength);
	    for (var i = 0; i < childrenLength; i++) {
	      childArray[i] = arguments[i + 2];
	    }
	    if (process.env.NODE_ENV !== 'production') {
	      if (Object.freeze) {
	        Object.freeze(childArray);
	      }
	    }
	    props.children = childArray;
	  }

	  // Resolve default props
	  if (type && type.defaultProps) {
	    var defaultProps = type.defaultProps;
	    for (propName in defaultProps) {
	      if (props[propName] === undefined) {
	        props[propName] = defaultProps[propName];
	      }
	    }
	  }
	  if (process.env.NODE_ENV !== 'production') {
	    if (key || ref) {
	      if (typeof props.$$typeof === 'undefined' || props.$$typeof !== REACT_ELEMENT_TYPE) {
	        var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
	        if (key) {
	          defineKeyPropWarningGetter(props, displayName);
	        }
	        if (ref) {
	          defineRefPropWarningGetter(props, displayName);
	        }
	      }
	    }
	  }
	  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	};

	/**
	 * Return a function that produces ReactElements of a given type.
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.createfactory
	 */
	ReactElement.createFactory = function (type) {
	  var factory = ReactElement.createElement.bind(null, type);
	  // Expose the type on the factory and the prototype so that it can be
	  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
	  // This should not be named `constructor` since this may not be the function
	  // that created the element, and it may not even be a constructor.
	  // Legacy hook TODO: Warn if this is accessed
	  factory.type = type;
	  return factory;
	};

	ReactElement.cloneAndReplaceKey = function (oldElement, newKey) {
	  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

	  return newElement;
	};

	/**
	 * Clone and return a new ReactElement using element as the starting point.
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.cloneelement
	 */
	ReactElement.cloneElement = function (element, config, children) {
	  var propName;

	  // Original props are copied
	  var props = _assign({}, element.props);

	  // Reserved names are extracted
	  var key = element.key;
	  var ref = element.ref;
	  // Self is preserved since the owner is preserved.
	  var self = element._self;
	  // Source is preserved since cloneElement is unlikely to be targeted by a
	  // transpiler, and the original source is probably a better indicator of the
	  // true owner.
	  var source = element._source;

	  // Owner will be preserved, unless ref is overridden
	  var owner = element._owner;

	  if (config != null) {
	    if (hasValidRef(config)) {
	      // Silently steal the ref from the parent.
	      ref = config.ref;
	      owner = ReactCurrentOwner.current;
	    }
	    if (hasValidKey(config)) {
	      key = '' + config.key;
	    }

	    // Remaining properties override existing props
	    var defaultProps;
	    if (element.type && element.type.defaultProps) {
	      defaultProps = element.type.defaultProps;
	    }
	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        if (config[propName] === undefined && defaultProps !== undefined) {
	          // Resolve default props
	          props[propName] = defaultProps[propName];
	        } else {
	          props[propName] = config[propName];
	        }
	      }
	    }
	  }

	  // Children can be more than one argument, and those are transferred onto
	  // the newly allocated props object.
	  var childrenLength = arguments.length - 2;
	  if (childrenLength === 1) {
	    props.children = children;
	  } else if (childrenLength > 1) {
	    var childArray = Array(childrenLength);
	    for (var i = 0; i < childrenLength; i++) {
	      childArray[i] = arguments[i + 2];
	    }
	    props.children = childArray;
	  }

	  return ReactElement(element.type, key, ref, self, source, owner, props);
	};

	/**
	 * Verifies the object is a ReactElement.
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.isvalidelement
	 * @param {?object} object
	 * @return {boolean} True if `object` is a valid component.
	 * @final
	 */
	ReactElement.isValidElement = function (object) {
	  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	};

	module.exports = ReactElement;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	/**
	 * Keeps track of the current owner.
	 *
	 * The current owner is the component who should own any components that are
	 * currently being constructed.
	 */
	var ReactCurrentOwner = {

	  /**
	   * @internal
	   * @type {ReactComponent}
	   */
	  current: null

	};

	module.exports = ReactCurrentOwner;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var emptyFunction = __webpack_require__(16);

	/**
	 * Similar to invariant but only logs a warning if the condition is not met.
	 * This can be used to log issues in development environments in critical
	 * paths. Removing the logging code for production environments will keep the
	 * same logic and follow the same code paths.
	 */

	var warning = emptyFunction;

	if (process.env.NODE_ENV !== 'production') {
	  (function () {
	    var printWarning = function printWarning(format) {
	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      var argIndex = 0;
	      var message = 'Warning: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      });
	      if (typeof console !== 'undefined') {
	        console.error(message);
	      }
	      try {
	        // --- Welcome to debugging React ---
	        // This error was thrown as a convenience so that you can use this stack
	        // to find the callsite that caused this warning to fire.
	        throw new Error(message);
	      } catch (x) {}
	    };

	    warning = function warning(condition, format) {
	      if (format === undefined) {
	        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
	      }

	      if (format.indexOf('Failed Composite propType: ') === 0) {
	        return; // Ignore CompositeComponent proptype check.
	      }

	      if (!condition) {
	        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	          args[_key2 - 2] = arguments[_key2];
	        }

	        printWarning.apply(undefined, [format].concat(args));
	      }
	    };
	  })();
	}

	module.exports = warning;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	function makeEmptyFunction(arg) {
	  return function () {
	    return arg;
	  };
	}

	/**
	 * This function accepts and discards inputs; it has no side effects. This is
	 * primarily useful idiomatically for overridable function endpoints which
	 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
	 */
	var emptyFunction = function emptyFunction() {};

	emptyFunction.thatReturns = makeEmptyFunction;
	emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
	emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
	emptyFunction.thatReturnsNull = makeEmptyFunction(null);
	emptyFunction.thatReturnsThis = function () {
	  return this;
	};
	emptyFunction.thatReturnsArgument = function (arg) {
	  return arg;
	};

	module.exports = emptyFunction;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var canDefineProperty = false;
	if (process.env.NODE_ENV !== 'production') {
	  try {
	    // $FlowFixMe https://github.com/facebook/flow/issues/285
	    Object.defineProperty({}, 'x', { get: function () {} });
	    canDefineProperty = true;
	  } catch (x) {
	    // IE will fail on defineProperty
	  }
	}

	module.exports = canDefineProperty;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 18 */
/***/ function(module, exports) {

	/**
	 * Copyright 2014-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	// The Symbol used to tag the ReactElement type. If there is no native Symbol
	// nor polyfill, then a plain number is used for performance.

	var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;

	module.exports = REACT_ELEMENT_TYPE;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var _prodInvariant = __webpack_require__(11);

	var ReactCurrentOwner = __webpack_require__(14);
	var REACT_ELEMENT_TYPE = __webpack_require__(18);

	var getIteratorFn = __webpack_require__(20);
	var invariant = __webpack_require__(12);
	var KeyEscapeUtils = __webpack_require__(21);
	var warning = __webpack_require__(15);

	var SEPARATOR = '.';
	var SUBSEPARATOR = ':';

	/**
	 * This is inlined from ReactElement since this file is shared between
	 * isomorphic and renderers. We could extract this to a
	 *
	 */

	/**
	 * TODO: Test that a single child and an array with one item have the same key
	 * pattern.
	 */

	var didWarnAboutMaps = false;

	/**
	 * Generate a key string that identifies a component within a set.
	 *
	 * @param {*} component A component that could contain a manual key.
	 * @param {number} index Index that is used if a manual key is not provided.
	 * @return {string}
	 */
	function getComponentKey(component, index) {
	  // Do some typechecking here since we call this blindly. We want to ensure
	  // that we don't block potential future ES APIs.
	  if (component && typeof component === 'object' && component.key != null) {
	    // Explicit key
	    return KeyEscapeUtils.escape(component.key);
	  }
	  // Implicit key determined by the index in the set
	  return index.toString(36);
	}

	/**
	 * @param {?*} children Children tree container.
	 * @param {!string} nameSoFar Name of the key path so far.
	 * @param {!function} callback Callback to invoke with each child found.
	 * @param {?*} traverseContext Used to pass information throughout the traversal
	 * process.
	 * @return {!number} The number of children in this subtree.
	 */
	function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
	  var type = typeof children;

	  if (type === 'undefined' || type === 'boolean') {
	    // All of the above are perceived as null.
	    children = null;
	  }

	  if (children === null || type === 'string' || type === 'number' ||
	  // The following is inlined from ReactElement. This means we can optimize
	  // some checks. React Fiber also inlines this logic for similar purposes.
	  type === 'object' && children.$$typeof === REACT_ELEMENT_TYPE) {
	    callback(traverseContext, children,
	    // If it's the only child, treat the name as if it was wrapped in an array
	    // so that it's consistent if the number of children grows.
	    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
	    return 1;
	  }

	  var child;
	  var nextName;
	  var subtreeCount = 0; // Count of children found in the current subtree.
	  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

	  if (Array.isArray(children)) {
	    for (var i = 0; i < children.length; i++) {
	      child = children[i];
	      nextName = nextNamePrefix + getComponentKey(child, i);
	      subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
	    }
	  } else {
	    var iteratorFn = getIteratorFn(children);
	    if (iteratorFn) {
	      var iterator = iteratorFn.call(children);
	      var step;
	      if (iteratorFn !== children.entries) {
	        var ii = 0;
	        while (!(step = iterator.next()).done) {
	          child = step.value;
	          nextName = nextNamePrefix + getComponentKey(child, ii++);
	          subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
	        }
	      } else {
	        if (process.env.NODE_ENV !== 'production') {
	          var mapsAsChildrenAddendum = '';
	          if (ReactCurrentOwner.current) {
	            var mapsAsChildrenOwnerName = ReactCurrentOwner.current.getName();
	            if (mapsAsChildrenOwnerName) {
	              mapsAsChildrenAddendum = ' Check the render method of `' + mapsAsChildrenOwnerName + '`.';
	            }
	          }
	          process.env.NODE_ENV !== 'production' ? warning(didWarnAboutMaps, 'Using Maps as children is not yet fully supported. It is an ' + 'experimental feature that might be removed. Convert it to a ' + 'sequence / iterable of keyed ReactElements instead.%s', mapsAsChildrenAddendum) : void 0;
	          didWarnAboutMaps = true;
	        }
	        // Iterator will provide entry [k,v] tuples rather than values.
	        while (!(step = iterator.next()).done) {
	          var entry = step.value;
	          if (entry) {
	            child = entry[1];
	            nextName = nextNamePrefix + KeyEscapeUtils.escape(entry[0]) + SUBSEPARATOR + getComponentKey(child, 0);
	            subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
	          }
	        }
	      }
	    } else if (type === 'object') {
	      var addendum = '';
	      if (process.env.NODE_ENV !== 'production') {
	        addendum = ' If you meant to render a collection of children, use an array ' + 'instead or wrap the object using createFragment(object) from the ' + 'React add-ons.';
	        if (children._isReactElement) {
	          addendum = ' It looks like you\'re using an element created by a different ' + 'version of React. Make sure to use only one copy of React.';
	        }
	        if (ReactCurrentOwner.current) {
	          var name = ReactCurrentOwner.current.getName();
	          if (name) {
	            addendum += ' Check the render method of `' + name + '`.';
	          }
	        }
	      }
	      var childrenString = String(children);
	       true ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum) : _prodInvariant('31', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum) : void 0;
	    }
	  }

	  return subtreeCount;
	}

	/**
	 * Traverses children that are typically specified as `props.children`, but
	 * might also be specified through attributes:
	 *
	 * - `traverseAllChildren(this.props.children, ...)`
	 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
	 *
	 * The `traverseContext` is an optional argument that is passed through the
	 * entire traversal. It can be used to store accumulations or anything else that
	 * the callback might find relevant.
	 *
	 * @param {?*} children Children tree object.
	 * @param {!function} callback To invoke upon traversing each child.
	 * @param {?*} traverseContext Context for traversal.
	 * @return {!number} The number of children in this subtree.
	 */
	function traverseAllChildren(children, callback, traverseContext) {
	  if (children == null) {
	    return 0;
	  }

	  return traverseAllChildrenImpl(children, '', callback, traverseContext);
	}

	module.exports = traverseAllChildren;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 20 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	/* global Symbol */

	var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

	/**
	 * Returns the iterator method function contained on the iterable object.
	 *
	 * Be sure to invoke the function with the iterable as context:
	 *
	 *     var iteratorFn = getIteratorFn(myIterable);
	 *     if (iteratorFn) {
	 *       var iterator = iteratorFn.call(myIterable);
	 *       ...
	 *     }
	 *
	 * @param {?object} maybeIterable
	 * @return {?function}
	 */
	function getIteratorFn(maybeIterable) {
	  var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
	  if (typeof iteratorFn === 'function') {
	    return iteratorFn;
	  }
	}

	module.exports = getIteratorFn;

/***/ },
/* 21 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	/**
	 * Escape and wrap key so it is safe to use as a reactid
	 *
	 * @param {string} key to be escaped.
	 * @return {string} the escaped key.
	 */

	function escape(key) {
	  var escapeRegex = /[=:]/g;
	  var escaperLookup = {
	    '=': '=0',
	    ':': '=2'
	  };
	  var escapedString = ('' + key).replace(escapeRegex, function (match) {
	    return escaperLookup[match];
	  });

	  return '$' + escapedString;
	}

	/**
	 * Unescape and unwrap key for human-readable display
	 *
	 * @param {string} key to unescape.
	 * @return {string} the unescaped key.
	 */
	function unescape(key) {
	  var unescapeRegex = /(=0|=2)/g;
	  var unescaperLookup = {
	    '=0': '=',
	    '=2': ':'
	  };
	  var keySubstring = key[0] === '.' && key[1] === '$' ? key.substring(2) : key.substring(1);

	  return ('' + keySubstring).replace(unescapeRegex, function (match) {
	    return unescaperLookup[match];
	  });
	}

	var KeyEscapeUtils = {
	  escape: escape,
	  unescape: unescape
	};

	module.exports = KeyEscapeUtils;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var _prodInvariant = __webpack_require__(11);

	var ReactNoopUpdateQueue = __webpack_require__(23);

	var canDefineProperty = __webpack_require__(17);
	var emptyObject = __webpack_require__(24);
	var invariant = __webpack_require__(12);
	var warning = __webpack_require__(15);

	/**
	 * Base class helpers for the updating state of a component.
	 */
	function ReactComponent(props, context, updater) {
	  this.props = props;
	  this.context = context;
	  this.refs = emptyObject;
	  // We initialize the default updater but the real one gets injected by the
	  // renderer.
	  this.updater = updater || ReactNoopUpdateQueue;
	}

	ReactComponent.prototype.isReactComponent = {};

	/**
	 * Sets a subset of the state. Always use this to mutate
	 * state. You should treat `this.state` as immutable.
	 *
	 * There is no guarantee that `this.state` will be immediately updated, so
	 * accessing `this.state` after calling this method may return the old value.
	 *
	 * There is no guarantee that calls to `setState` will run synchronously,
	 * as they may eventually be batched together.  You can provide an optional
	 * callback that will be executed when the call to setState is actually
	 * completed.
	 *
	 * When a function is provided to setState, it will be called at some point in
	 * the future (not synchronously). It will be called with the up to date
	 * component arguments (state, props, context). These values can be different
	 * from this.* because your function may be called after receiveProps but before
	 * shouldComponentUpdate, and this new state, props, and context will not yet be
	 * assigned to this.
	 *
	 * @param {object|function} partialState Next partial state or function to
	 *        produce next partial state to be merged with current state.
	 * @param {?function} callback Called after state is updated.
	 * @final
	 * @protected
	 */
	ReactComponent.prototype.setState = function (partialState, callback) {
	  !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : _prodInvariant('85') : void 0;
	  this.updater.enqueueSetState(this, partialState);
	  if (callback) {
	    this.updater.enqueueCallback(this, callback, 'setState');
	  }
	};

	/**
	 * Forces an update. This should only be invoked when it is known with
	 * certainty that we are **not** in a DOM transaction.
	 *
	 * You may want to call this when you know that some deeper aspect of the
	 * component's state has changed but `setState` was not called.
	 *
	 * This will not invoke `shouldComponentUpdate`, but it will invoke
	 * `componentWillUpdate` and `componentDidUpdate`.
	 *
	 * @param {?function} callback Called after update is complete.
	 * @final
	 * @protected
	 */
	ReactComponent.prototype.forceUpdate = function (callback) {
	  this.updater.enqueueForceUpdate(this);
	  if (callback) {
	    this.updater.enqueueCallback(this, callback, 'forceUpdate');
	  }
	};

	/**
	 * Deprecated APIs. These APIs used to exist on classic React classes but since
	 * we would like to deprecate them, we're not going to move them over to this
	 * modern base class. Instead, we define a getter that warns if it's accessed.
	 */
	if (process.env.NODE_ENV !== 'production') {
	  var deprecatedAPIs = {
	    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
	    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
	  };
	  var defineDeprecationWarning = function (methodName, info) {
	    if (canDefineProperty) {
	      Object.defineProperty(ReactComponent.prototype, methodName, {
	        get: function () {
	          process.env.NODE_ENV !== 'production' ? warning(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]) : void 0;
	          return undefined;
	        }
	      });
	    }
	  };
	  for (var fnName in deprecatedAPIs) {
	    if (deprecatedAPIs.hasOwnProperty(fnName)) {
	      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
	    }
	  }
	}

	module.exports = ReactComponent;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var warning = __webpack_require__(15);

	function warnNoop(publicInstance, callerName) {
	  if (process.env.NODE_ENV !== 'production') {
	    var constructor = publicInstance.constructor;
	    process.env.NODE_ENV !== 'production' ? warning(false, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op. Please check the code for the %s component.', callerName, callerName, constructor && (constructor.displayName || constructor.name) || 'ReactClass') : void 0;
	  }
	}

	/**
	 * This is the abstract API for an update queue.
	 */
	var ReactNoopUpdateQueue = {

	  /**
	   * Checks whether or not this composite component is mounted.
	   * @param {ReactClass} publicInstance The instance we want to test.
	   * @return {boolean} True if mounted, false otherwise.
	   * @protected
	   * @final
	   */
	  isMounted: function (publicInstance) {
	    return false;
	  },

	  /**
	   * Enqueue a callback that will be executed after all the pending updates
	   * have processed.
	   *
	   * @param {ReactClass} publicInstance The instance to use as `this` context.
	   * @param {?function} callback Called after state is updated.
	   * @internal
	   */
	  enqueueCallback: function (publicInstance, callback) {},

	  /**
	   * Forces an update. This should only be invoked when it is known with
	   * certainty that we are **not** in a DOM transaction.
	   *
	   * You may want to call this when you know that some deeper aspect of the
	   * component's state has changed but `setState` was not called.
	   *
	   * This will not invoke `shouldComponentUpdate`, but it will invoke
	   * `componentWillUpdate` and `componentDidUpdate`.
	   *
	   * @param {ReactClass} publicInstance The instance that should rerender.
	   * @internal
	   */
	  enqueueForceUpdate: function (publicInstance) {
	    warnNoop(publicInstance, 'forceUpdate');
	  },

	  /**
	   * Replaces all of the state. Always use this or `setState` to mutate state.
	   * You should treat `this.state` as immutable.
	   *
	   * There is no guarantee that `this.state` will be immediately updated, so
	   * accessing `this.state` after calling this method may return the old value.
	   *
	   * @param {ReactClass} publicInstance The instance that should rerender.
	   * @param {object} completeState Next state.
	   * @internal
	   */
	  enqueueReplaceState: function (publicInstance, completeState) {
	    warnNoop(publicInstance, 'replaceState');
	  },

	  /**
	   * Sets a subset of the state. This only exists because _pendingState is
	   * internal. This provides a merging strategy that is not available to deep
	   * properties which is confusing. TODO: Expose pendingState or don't use it
	   * during the merge.
	   *
	   * @param {ReactClass} publicInstance The instance that should rerender.
	   * @param {object} partialState Next partial state to be merged with state.
	   * @internal
	   */
	  enqueueSetState: function (publicInstance, partialState) {
	    warnNoop(publicInstance, 'setState');
	  }
	};

	module.exports = ReactNoopUpdateQueue;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var emptyObject = {};

	if (process.env.NODE_ENV !== 'production') {
	  Object.freeze(emptyObject);
	}

	module.exports = emptyObject;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var _assign = __webpack_require__(8);

	var ReactComponent = __webpack_require__(22);
	var ReactNoopUpdateQueue = __webpack_require__(23);

	var emptyObject = __webpack_require__(24);

	/**
	 * Base class helpers for the updating state of a component.
	 */
	function ReactPureComponent(props, context, updater) {
	  // Duplicated from ReactComponent.
	  this.props = props;
	  this.context = context;
	  this.refs = emptyObject;
	  // We initialize the default updater but the real one gets injected by the
	  // renderer.
	  this.updater = updater || ReactNoopUpdateQueue;
	}

	function ComponentDummy() {}
	ComponentDummy.prototype = ReactComponent.prototype;
	ReactPureComponent.prototype = new ComponentDummy();
	ReactPureComponent.prototype.constructor = ReactPureComponent;
	// Avoid an extra prototype jump for these methods.
	_assign(ReactPureComponent.prototype, ReactComponent.prototype);
	ReactPureComponent.prototype.isPureReactComponent = true;

	module.exports = ReactPureComponent;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var _prodInvariant = __webpack_require__(11),
	    _assign = __webpack_require__(8);

	var ReactComponent = __webpack_require__(22);
	var ReactElement = __webpack_require__(13);
	var ReactPropTypeLocationNames = __webpack_require__(27);
	var ReactNoopUpdateQueue = __webpack_require__(23);

	var emptyObject = __webpack_require__(24);
	var invariant = __webpack_require__(12);
	var warning = __webpack_require__(15);

	var MIXINS_KEY = 'mixins';

	// Helper function to allow the creation of anonymous functions which do not
	// have .name set to the name of the variable being assigned to.
	function identity(fn) {
	  return fn;
	}

	/**
	 * Policies that describe methods in `ReactClassInterface`.
	 */


	var injectedMixins = [];

	/**
	 * Composite components are higher-level components that compose other composite
	 * or host components.
	 *
	 * To create a new type of `ReactClass`, pass a specification of
	 * your new class to `React.createClass`. The only requirement of your class
	 * specification is that you implement a `render` method.
	 *
	 *   var MyComponent = React.createClass({
	 *     render: function() {
	 *       return <div>Hello World</div>;
	 *     }
	 *   });
	 *
	 * The class specification supports a specific protocol of methods that have
	 * special meaning (e.g. `render`). See `ReactClassInterface` for
	 * more the comprehensive protocol. Any other properties and methods in the
	 * class specification will be available on the prototype.
	 *
	 * @interface ReactClassInterface
	 * @internal
	 */
	var ReactClassInterface = {

	  /**
	   * An array of Mixin objects to include when defining your component.
	   *
	   * @type {array}
	   * @optional
	   */
	  mixins: 'DEFINE_MANY',

	  /**
	   * An object containing properties and methods that should be defined on
	   * the component's constructor instead of its prototype (static methods).
	   *
	   * @type {object}
	   * @optional
	   */
	  statics: 'DEFINE_MANY',

	  /**
	   * Definition of prop types for this component.
	   *
	   * @type {object}
	   * @optional
	   */
	  propTypes: 'DEFINE_MANY',

	  /**
	   * Definition of context types for this component.
	   *
	   * @type {object}
	   * @optional
	   */
	  contextTypes: 'DEFINE_MANY',

	  /**
	   * Definition of context types this component sets for its children.
	   *
	   * @type {object}
	   * @optional
	   */
	  childContextTypes: 'DEFINE_MANY',

	  // ==== Definition methods ====

	  /**
	   * Invoked when the component is mounted. Values in the mapping will be set on
	   * `this.props` if that prop is not specified (i.e. using an `in` check).
	   *
	   * This method is invoked before `getInitialState` and therefore cannot rely
	   * on `this.state` or use `this.setState`.
	   *
	   * @return {object}
	   * @optional
	   */
	  getDefaultProps: 'DEFINE_MANY_MERGED',

	  /**
	   * Invoked once before the component is mounted. The return value will be used
	   * as the initial value of `this.state`.
	   *
	   *   getInitialState: function() {
	   *     return {
	   *       isOn: false,
	   *       fooBaz: new BazFoo()
	   *     }
	   *   }
	   *
	   * @return {object}
	   * @optional
	   */
	  getInitialState: 'DEFINE_MANY_MERGED',

	  /**
	   * @return {object}
	   * @optional
	   */
	  getChildContext: 'DEFINE_MANY_MERGED',

	  /**
	   * Uses props from `this.props` and state from `this.state` to render the
	   * structure of the component.
	   *
	   * No guarantees are made about when or how often this method is invoked, so
	   * it must not have side effects.
	   *
	   *   render: function() {
	   *     var name = this.props.name;
	   *     return <div>Hello, {name}!</div>;
	   *   }
	   *
	   * @return {ReactComponent}
	   * @nosideeffects
	   * @required
	   */
	  render: 'DEFINE_ONCE',

	  // ==== Delegate methods ====

	  /**
	   * Invoked when the component is initially created and about to be mounted.
	   * This may have side effects, but any external subscriptions or data created
	   * by this method must be cleaned up in `componentWillUnmount`.
	   *
	   * @optional
	   */
	  componentWillMount: 'DEFINE_MANY',

	  /**
	   * Invoked when the component has been mounted and has a DOM representation.
	   * However, there is no guarantee that the DOM node is in the document.
	   *
	   * Use this as an opportunity to operate on the DOM when the component has
	   * been mounted (initialized and rendered) for the first time.
	   *
	   * @param {DOMElement} rootNode DOM element representing the component.
	   * @optional
	   */
	  componentDidMount: 'DEFINE_MANY',

	  /**
	   * Invoked before the component receives new props.
	   *
	   * Use this as an opportunity to react to a prop transition by updating the
	   * state using `this.setState`. Current props are accessed via `this.props`.
	   *
	   *   componentWillReceiveProps: function(nextProps, nextContext) {
	   *     this.setState({
	   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
	   *     });
	   *   }
	   *
	   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
	   * transition may cause a state change, but the opposite is not true. If you
	   * need it, you are probably looking for `componentWillUpdate`.
	   *
	   * @param {object} nextProps
	   * @optional
	   */
	  componentWillReceiveProps: 'DEFINE_MANY',

	  /**
	   * Invoked while deciding if the component should be updated as a result of
	   * receiving new props, state and/or context.
	   *
	   * Use this as an opportunity to `return false` when you're certain that the
	   * transition to the new props/state/context will not require a component
	   * update.
	   *
	   *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
	   *     return !equal(nextProps, this.props) ||
	   *       !equal(nextState, this.state) ||
	   *       !equal(nextContext, this.context);
	   *   }
	   *
	   * @param {object} nextProps
	   * @param {?object} nextState
	   * @param {?object} nextContext
	   * @return {boolean} True if the component should update.
	   * @optional
	   */
	  shouldComponentUpdate: 'DEFINE_ONCE',

	  /**
	   * Invoked when the component is about to update due to a transition from
	   * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
	   * and `nextContext`.
	   *
	   * Use this as an opportunity to perform preparation before an update occurs.
	   *
	   * NOTE: You **cannot** use `this.setState()` in this method.
	   *
	   * @param {object} nextProps
	   * @param {?object} nextState
	   * @param {?object} nextContext
	   * @param {ReactReconcileTransaction} transaction
	   * @optional
	   */
	  componentWillUpdate: 'DEFINE_MANY',

	  /**
	   * Invoked when the component's DOM representation has been updated.
	   *
	   * Use this as an opportunity to operate on the DOM when the component has
	   * been updated.
	   *
	   * @param {object} prevProps
	   * @param {?object} prevState
	   * @param {?object} prevContext
	   * @param {DOMElement} rootNode DOM element representing the component.
	   * @optional
	   */
	  componentDidUpdate: 'DEFINE_MANY',

	  /**
	   * Invoked when the component is about to be removed from its parent and have
	   * its DOM representation destroyed.
	   *
	   * Use this as an opportunity to deallocate any external resources.
	   *
	   * NOTE: There is no `componentDidUnmount` since your component will have been
	   * destroyed by that point.
	   *
	   * @optional
	   */
	  componentWillUnmount: 'DEFINE_MANY',

	  // ==== Advanced methods ====

	  /**
	   * Updates the component's currently mounted DOM representation.
	   *
	   * By default, this implements React's rendering and reconciliation algorithm.
	   * Sophisticated clients may wish to override this.
	   *
	   * @param {ReactReconcileTransaction} transaction
	   * @internal
	   * @overridable
	   */
	  updateComponent: 'OVERRIDE_BASE'

	};

	/**
	 * Mapping from class specification keys to special processing functions.
	 *
	 * Although these are declared like instance properties in the specification
	 * when defining classes using `React.createClass`, they are actually static
	 * and are accessible on the constructor instead of the prototype. Despite
	 * being static, they must be defined outside of the "statics" key under
	 * which all other static methods are defined.
	 */
	var RESERVED_SPEC_KEYS = {
	  displayName: function (Constructor, displayName) {
	    Constructor.displayName = displayName;
	  },
	  mixins: function (Constructor, mixins) {
	    if (mixins) {
	      for (var i = 0; i < mixins.length; i++) {
	        mixSpecIntoComponent(Constructor, mixins[i]);
	      }
	    }
	  },
	  childContextTypes: function (Constructor, childContextTypes) {
	    if (process.env.NODE_ENV !== 'production') {
	      validateTypeDef(Constructor, childContextTypes, 'childContext');
	    }
	    Constructor.childContextTypes = _assign({}, Constructor.childContextTypes, childContextTypes);
	  },
	  contextTypes: function (Constructor, contextTypes) {
	    if (process.env.NODE_ENV !== 'production') {
	      validateTypeDef(Constructor, contextTypes, 'context');
	    }
	    Constructor.contextTypes = _assign({}, Constructor.contextTypes, contextTypes);
	  },
	  /**
	   * Special case getDefaultProps which should move into statics but requires
	   * automatic merging.
	   */
	  getDefaultProps: function (Constructor, getDefaultProps) {
	    if (Constructor.getDefaultProps) {
	      Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
	    } else {
	      Constructor.getDefaultProps = getDefaultProps;
	    }
	  },
	  propTypes: function (Constructor, propTypes) {
	    if (process.env.NODE_ENV !== 'production') {
	      validateTypeDef(Constructor, propTypes, 'prop');
	    }
	    Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
	  },
	  statics: function (Constructor, statics) {
	    mixStaticSpecIntoComponent(Constructor, statics);
	  },
	  autobind: function () {} };

	function validateTypeDef(Constructor, typeDef, location) {
	  for (var propName in typeDef) {
	    if (typeDef.hasOwnProperty(propName)) {
	      // use a warning instead of an invariant so components
	      // don't show up in prod but only in __DEV__
	      process.env.NODE_ENV !== 'production' ? warning(typeof typeDef[propName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', Constructor.displayName || 'ReactClass', ReactPropTypeLocationNames[location], propName) : void 0;
	    }
	  }
	}

	function validateMethodOverride(isAlreadyDefined, name) {
	  var specPolicy = ReactClassInterface.hasOwnProperty(name) ? ReactClassInterface[name] : null;

	  // Disallow overriding of base class methods unless explicitly allowed.
	  if (ReactClassMixin.hasOwnProperty(name)) {
	    !(specPolicy === 'OVERRIDE_BASE') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to override `%s` from your class specification. Ensure that your method names do not overlap with React methods.', name) : _prodInvariant('73', name) : void 0;
	  }

	  // Disallow defining methods more than once unless explicitly allowed.
	  if (isAlreadyDefined) {
	    !(specPolicy === 'DEFINE_MANY' || specPolicy === 'DEFINE_MANY_MERGED') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClassInterface: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.', name) : _prodInvariant('74', name) : void 0;
	  }
	}

	/**
	 * Mixin helper which handles policy validation and reserved
	 * specification keys when building React classes.
	 */
	function mixSpecIntoComponent(Constructor, spec) {
	  if (!spec) {
	    if (process.env.NODE_ENV !== 'production') {
	      var typeofSpec = typeof spec;
	      var isMixinValid = typeofSpec === 'object' && spec !== null;

	      process.env.NODE_ENV !== 'production' ? warning(isMixinValid, '%s: You\'re attempting to include a mixin that is either null ' + 'or not an object. Check the mixins included by the component, ' + 'as well as any mixins they include themselves. ' + 'Expected object but got %s.', Constructor.displayName || 'ReactClass', spec === null ? null : typeofSpec) : void 0;
	    }

	    return;
	  }

	  !(typeof spec !== 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to use a component class or function as a mixin. Instead, just use a regular object.') : _prodInvariant('75') : void 0;
	  !!ReactElement.isValidElement(spec) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You\'re attempting to use a component as a mixin. Instead, just use a regular object.') : _prodInvariant('76') : void 0;

	  var proto = Constructor.prototype;
	  var autoBindPairs = proto.__reactAutoBindPairs;

	  // By handling mixins before any other properties, we ensure the same
	  // chaining order is applied to methods with DEFINE_MANY policy, whether
	  // mixins are listed before or after these methods in the spec.
	  if (spec.hasOwnProperty(MIXINS_KEY)) {
	    RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
	  }

	  for (var name in spec) {
	    if (!spec.hasOwnProperty(name)) {
	      continue;
	    }

	    if (name === MIXINS_KEY) {
	      // We have already handled mixins in a special case above.
	      continue;
	    }

	    var property = spec[name];
	    var isAlreadyDefined = proto.hasOwnProperty(name);
	    validateMethodOverride(isAlreadyDefined, name);

	    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
	      RESERVED_SPEC_KEYS[name](Constructor, property);
	    } else {
	      // Setup methods on prototype:
	      // The following member methods should not be automatically bound:
	      // 1. Expected ReactClass methods (in the "interface").
	      // 2. Overridden methods (that were mixed in).
	      var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
	      var isFunction = typeof property === 'function';
	      var shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;

	      if (shouldAutoBind) {
	        autoBindPairs.push(name, property);
	        proto[name] = property;
	      } else {
	        if (isAlreadyDefined) {
	          var specPolicy = ReactClassInterface[name];

	          // These cases should already be caught by validateMethodOverride.
	          !(isReactClassMethod && (specPolicy === 'DEFINE_MANY_MERGED' || specPolicy === 'DEFINE_MANY')) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: Unexpected spec policy %s for key %s when mixing in component specs.', specPolicy, name) : _prodInvariant('77', specPolicy, name) : void 0;

	          // For methods which are defined more than once, call the existing
	          // methods before calling the new property, merging if appropriate.
	          if (specPolicy === 'DEFINE_MANY_MERGED') {
	            proto[name] = createMergedResultFunction(proto[name], property);
	          } else if (specPolicy === 'DEFINE_MANY') {
	            proto[name] = createChainedFunction(proto[name], property);
	          }
	        } else {
	          proto[name] = property;
	          if (process.env.NODE_ENV !== 'production') {
	            // Add verbose displayName to the function, which helps when looking
	            // at profiling tools.
	            if (typeof property === 'function' && spec.displayName) {
	              proto[name].displayName = spec.displayName + '_' + name;
	            }
	          }
	        }
	      }
	    }
	  }
	}

	function mixStaticSpecIntoComponent(Constructor, statics) {
	  if (!statics) {
	    return;
	  }
	  for (var name in statics) {
	    var property = statics[name];
	    if (!statics.hasOwnProperty(name)) {
	      continue;
	    }

	    var isReserved = name in RESERVED_SPEC_KEYS;
	    !!isReserved ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define a reserved property, `%s`, that shouldn\'t be on the "statics" key. Define it as an instance property instead; it will still be accessible on the constructor.', name) : _prodInvariant('78', name) : void 0;

	    var isInherited = name in Constructor;
	    !!isInherited ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.', name) : _prodInvariant('79', name) : void 0;
	    Constructor[name] = property;
	  }
	}

	/**
	 * Merge two objects, but throw if both contain the same key.
	 *
	 * @param {object} one The first object, which is mutated.
	 * @param {object} two The second object
	 * @return {object} one after it has been mutated to contain everything in two.
	 */
	function mergeIntoWithNoDuplicateKeys(one, two) {
	  !(one && two && typeof one === 'object' && typeof two === 'object') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.') : _prodInvariant('80') : void 0;

	  for (var key in two) {
	    if (two.hasOwnProperty(key)) {
	      !(one[key] === undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mergeIntoWithNoDuplicateKeys(): Tried to merge two objects with the same key: `%s`. This conflict may be due to a mixin; in particular, this may be caused by two getInitialState() or getDefaultProps() methods returning objects with clashing keys.', key) : _prodInvariant('81', key) : void 0;
	      one[key] = two[key];
	    }
	  }
	  return one;
	}

	/**
	 * Creates a function that invokes two functions and merges their return values.
	 *
	 * @param {function} one Function to invoke first.
	 * @param {function} two Function to invoke second.
	 * @return {function} Function that invokes the two argument functions.
	 * @private
	 */
	function createMergedResultFunction(one, two) {
	  return function mergedResult() {
	    var a = one.apply(this, arguments);
	    var b = two.apply(this, arguments);
	    if (a == null) {
	      return b;
	    } else if (b == null) {
	      return a;
	    }
	    var c = {};
	    mergeIntoWithNoDuplicateKeys(c, a);
	    mergeIntoWithNoDuplicateKeys(c, b);
	    return c;
	  };
	}

	/**
	 * Creates a function that invokes two functions and ignores their return vales.
	 *
	 * @param {function} one Function to invoke first.
	 * @param {function} two Function to invoke second.
	 * @return {function} Function that invokes the two argument functions.
	 * @private
	 */
	function createChainedFunction(one, two) {
	  return function chainedFunction() {
	    one.apply(this, arguments);
	    two.apply(this, arguments);
	  };
	}

	/**
	 * Binds a method to the component.
	 *
	 * @param {object} component Component whose method is going to be bound.
	 * @param {function} method Method to be bound.
	 * @return {function} The bound method.
	 */
	function bindAutoBindMethod(component, method) {
	  var boundMethod = method.bind(component);
	  if (process.env.NODE_ENV !== 'production') {
	    boundMethod.__reactBoundContext = component;
	    boundMethod.__reactBoundMethod = method;
	    boundMethod.__reactBoundArguments = null;
	    var componentName = component.constructor.displayName;
	    var _bind = boundMethod.bind;
	    boundMethod.bind = function (newThis) {
	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      // User is trying to bind() an autobound method; we effectively will
	      // ignore the value of "this" that the user is trying to use, so
	      // let's warn.
	      if (newThis !== component && newThis !== null) {
	        process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): React component methods may only be bound to the ' + 'component instance. See %s', componentName) : void 0;
	      } else if (!args.length) {
	        process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): You are binding a component method to the component. ' + 'React does this for you automatically in a high-performance ' + 'way, so you can safely remove this call. See %s', componentName) : void 0;
	        return boundMethod;
	      }
	      var reboundMethod = _bind.apply(boundMethod, arguments);
	      reboundMethod.__reactBoundContext = component;
	      reboundMethod.__reactBoundMethod = method;
	      reboundMethod.__reactBoundArguments = args;
	      return reboundMethod;
	    };
	  }
	  return boundMethod;
	}

	/**
	 * Binds all auto-bound methods in a component.
	 *
	 * @param {object} component Component whose method is going to be bound.
	 */
	function bindAutoBindMethods(component) {
	  var pairs = component.__reactAutoBindPairs;
	  for (var i = 0; i < pairs.length; i += 2) {
	    var autoBindKey = pairs[i];
	    var method = pairs[i + 1];
	    component[autoBindKey] = bindAutoBindMethod(component, method);
	  }
	}

	/**
	 * Add more to the ReactClass base class. These are all legacy features and
	 * therefore not already part of the modern ReactComponent.
	 */
	var ReactClassMixin = {

	  /**
	   * TODO: This will be deprecated because state should always keep a consistent
	   * type signature and the only use case for this, is to avoid that.
	   */
	  replaceState: function (newState, callback) {
	    this.updater.enqueueReplaceState(this, newState);
	    if (callback) {
	      this.updater.enqueueCallback(this, callback, 'replaceState');
	    }
	  },

	  /**
	   * Checks whether or not this composite component is mounted.
	   * @return {boolean} True if mounted, false otherwise.
	   * @protected
	   * @final
	   */
	  isMounted: function () {
	    return this.updater.isMounted(this);
	  }
	};

	var ReactClassComponent = function () {};
	_assign(ReactClassComponent.prototype, ReactComponent.prototype, ReactClassMixin);

	/**
	 * Module for creating composite components.
	 *
	 * @class ReactClass
	 */
	var ReactClass = {

	  /**
	   * Creates a composite component class given a class specification.
	   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
	   *
	   * @param {object} spec Class specification (which must define `render`).
	   * @return {function} Component constructor function.
	   * @public
	   */
	  createClass: function (spec) {
	    // To keep our warnings more understandable, we'll use a little hack here to
	    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
	    // unnecessarily identify a class without displayName as 'Constructor'.
	    var Constructor = identity(function (props, context, updater) {
	      // This constructor gets overridden by mocks. The argument is used
	      // by mocks to assert on what gets mounted.

	      if (process.env.NODE_ENV !== 'production') {
	        process.env.NODE_ENV !== 'production' ? warning(this instanceof Constructor, 'Something is calling a React component directly. Use a factory or ' + 'JSX instead. See: https://fb.me/react-legacyfactory') : void 0;
	      }

	      // Wire up auto-binding
	      if (this.__reactAutoBindPairs.length) {
	        bindAutoBindMethods(this);
	      }

	      this.props = props;
	      this.context = context;
	      this.refs = emptyObject;
	      this.updater = updater || ReactNoopUpdateQueue;

	      this.state = null;

	      // ReactClasses doesn't have constructors. Instead, they use the
	      // getInitialState and componentWillMount methods for initialization.

	      var initialState = this.getInitialState ? this.getInitialState() : null;
	      if (process.env.NODE_ENV !== 'production') {
	        // We allow auto-mocks to proceed as if they're returning null.
	        if (initialState === undefined && this.getInitialState._isMockFunction) {
	          // This is probably bad practice. Consider warning here and
	          // deprecating this convenience.
	          initialState = null;
	        }
	      }
	      !(typeof initialState === 'object' && !Array.isArray(initialState)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.getInitialState(): must return an object or null', Constructor.displayName || 'ReactCompositeComponent') : _prodInvariant('82', Constructor.displayName || 'ReactCompositeComponent') : void 0;

	      this.state = initialState;
	    });
	    Constructor.prototype = new ReactClassComponent();
	    Constructor.prototype.constructor = Constructor;
	    Constructor.prototype.__reactAutoBindPairs = [];

	    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

	    mixSpecIntoComponent(Constructor, spec);

	    // Initialize the defaultProps property after all mixins have been merged.
	    if (Constructor.getDefaultProps) {
	      Constructor.defaultProps = Constructor.getDefaultProps();
	    }

	    if (process.env.NODE_ENV !== 'production') {
	      // This is a tag to indicate that the use of these method names is ok,
	      // since it's used with createClass. If it's not, then it's likely a
	      // mistake so we'll warn you to use the static property, property
	      // initializer or constructor respectively.
	      if (Constructor.getDefaultProps) {
	        Constructor.getDefaultProps.isReactClassApproved = {};
	      }
	      if (Constructor.prototype.getInitialState) {
	        Constructor.prototype.getInitialState.isReactClassApproved = {};
	      }
	    }

	    !Constructor.prototype.render ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createClass(...): Class specification must implement a `render` method.') : _prodInvariant('83') : void 0;

	    if (process.env.NODE_ENV !== 'production') {
	      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', spec.displayName || 'A component') : void 0;
	      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', spec.displayName || 'A component') : void 0;
	    }

	    // Reduce time spent doing lookups by setting these on the prototype.
	    for (var methodName in ReactClassInterface) {
	      if (!Constructor.prototype[methodName]) {
	        Constructor.prototype[methodName] = null;
	      }
	    }

	    return Constructor;
	  },

	  injection: {
	    injectMixin: function (mixin) {
	      injectedMixins.push(mixin);
	    }
	  }

	};

	module.exports = ReactClass;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var ReactPropTypeLocationNames = {};

	if (process.env.NODE_ENV !== 'production') {
	  ReactPropTypeLocationNames = {
	    prop: 'prop',
	    context: 'context',
	    childContext: 'child context'
	  };
	}

	module.exports = ReactPropTypeLocationNames;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var ReactElement = __webpack_require__(13);

	/**
	 * Create a factory that creates HTML tag elements.
	 *
	 * @private
	 */
	var createDOMFactory = ReactElement.createFactory;
	if (process.env.NODE_ENV !== 'production') {
	  var ReactElementValidator = __webpack_require__(29);
	  createDOMFactory = ReactElementValidator.createFactory;
	}

	/**
	 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
	 * This is also accessible via `React.DOM`.
	 *
	 * @public
	 */
	var ReactDOMFactories = {
	  a: createDOMFactory('a'),
	  abbr: createDOMFactory('abbr'),
	  address: createDOMFactory('address'),
	  area: createDOMFactory('area'),
	  article: createDOMFactory('article'),
	  aside: createDOMFactory('aside'),
	  audio: createDOMFactory('audio'),
	  b: createDOMFactory('b'),
	  base: createDOMFactory('base'),
	  bdi: createDOMFactory('bdi'),
	  bdo: createDOMFactory('bdo'),
	  big: createDOMFactory('big'),
	  blockquote: createDOMFactory('blockquote'),
	  body: createDOMFactory('body'),
	  br: createDOMFactory('br'),
	  button: createDOMFactory('button'),
	  canvas: createDOMFactory('canvas'),
	  caption: createDOMFactory('caption'),
	  cite: createDOMFactory('cite'),
	  code: createDOMFactory('code'),
	  col: createDOMFactory('col'),
	  colgroup: createDOMFactory('colgroup'),
	  data: createDOMFactory('data'),
	  datalist: createDOMFactory('datalist'),
	  dd: createDOMFactory('dd'),
	  del: createDOMFactory('del'),
	  details: createDOMFactory('details'),
	  dfn: createDOMFactory('dfn'),
	  dialog: createDOMFactory('dialog'),
	  div: createDOMFactory('div'),
	  dl: createDOMFactory('dl'),
	  dt: createDOMFactory('dt'),
	  em: createDOMFactory('em'),
	  embed: createDOMFactory('embed'),
	  fieldset: createDOMFactory('fieldset'),
	  figcaption: createDOMFactory('figcaption'),
	  figure: createDOMFactory('figure'),
	  footer: createDOMFactory('footer'),
	  form: createDOMFactory('form'),
	  h1: createDOMFactory('h1'),
	  h2: createDOMFactory('h2'),
	  h3: createDOMFactory('h3'),
	  h4: createDOMFactory('h4'),
	  h5: createDOMFactory('h5'),
	  h6: createDOMFactory('h6'),
	  head: createDOMFactory('head'),
	  header: createDOMFactory('header'),
	  hgroup: createDOMFactory('hgroup'),
	  hr: createDOMFactory('hr'),
	  html: createDOMFactory('html'),
	  i: createDOMFactory('i'),
	  iframe: createDOMFactory('iframe'),
	  img: createDOMFactory('img'),
	  input: createDOMFactory('input'),
	  ins: createDOMFactory('ins'),
	  kbd: createDOMFactory('kbd'),
	  keygen: createDOMFactory('keygen'),
	  label: createDOMFactory('label'),
	  legend: createDOMFactory('legend'),
	  li: createDOMFactory('li'),
	  link: createDOMFactory('link'),
	  main: createDOMFactory('main'),
	  map: createDOMFactory('map'),
	  mark: createDOMFactory('mark'),
	  menu: createDOMFactory('menu'),
	  menuitem: createDOMFactory('menuitem'),
	  meta: createDOMFactory('meta'),
	  meter: createDOMFactory('meter'),
	  nav: createDOMFactory('nav'),
	  noscript: createDOMFactory('noscript'),
	  object: createDOMFactory('object'),
	  ol: createDOMFactory('ol'),
	  optgroup: createDOMFactory('optgroup'),
	  option: createDOMFactory('option'),
	  output: createDOMFactory('output'),
	  p: createDOMFactory('p'),
	  param: createDOMFactory('param'),
	  picture: createDOMFactory('picture'),
	  pre: createDOMFactory('pre'),
	  progress: createDOMFactory('progress'),
	  q: createDOMFactory('q'),
	  rp: createDOMFactory('rp'),
	  rt: createDOMFactory('rt'),
	  ruby: createDOMFactory('ruby'),
	  s: createDOMFactory('s'),
	  samp: createDOMFactory('samp'),
	  script: createDOMFactory('script'),
	  section: createDOMFactory('section'),
	  select: createDOMFactory('select'),
	  small: createDOMFactory('small'),
	  source: createDOMFactory('source'),
	  span: createDOMFactory('span'),
	  strong: createDOMFactory('strong'),
	  style: createDOMFactory('style'),
	  sub: createDOMFactory('sub'),
	  summary: createDOMFactory('summary'),
	  sup: createDOMFactory('sup'),
	  table: createDOMFactory('table'),
	  tbody: createDOMFactory('tbody'),
	  td: createDOMFactory('td'),
	  textarea: createDOMFactory('textarea'),
	  tfoot: createDOMFactory('tfoot'),
	  th: createDOMFactory('th'),
	  thead: createDOMFactory('thead'),
	  time: createDOMFactory('time'),
	  title: createDOMFactory('title'),
	  tr: createDOMFactory('tr'),
	  track: createDOMFactory('track'),
	  u: createDOMFactory('u'),
	  ul: createDOMFactory('ul'),
	  'var': createDOMFactory('var'),
	  video: createDOMFactory('video'),
	  wbr: createDOMFactory('wbr'),

	  // SVG
	  circle: createDOMFactory('circle'),
	  clipPath: createDOMFactory('clipPath'),
	  defs: createDOMFactory('defs'),
	  ellipse: createDOMFactory('ellipse'),
	  g: createDOMFactory('g'),
	  image: createDOMFactory('image'),
	  line: createDOMFactory('line'),
	  linearGradient: createDOMFactory('linearGradient'),
	  mask: createDOMFactory('mask'),
	  path: createDOMFactory('path'),
	  pattern: createDOMFactory('pattern'),
	  polygon: createDOMFactory('polygon'),
	  polyline: createDOMFactory('polyline'),
	  radialGradient: createDOMFactory('radialGradient'),
	  rect: createDOMFactory('rect'),
	  stop: createDOMFactory('stop'),
	  svg: createDOMFactory('svg'),
	  text: createDOMFactory('text'),
	  tspan: createDOMFactory('tspan')
	};

	module.exports = ReactDOMFactories;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2014-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	/**
	 * ReactElementValidator provides a wrapper around a element factory
	 * which validates the props passed to the element. This is intended to be
	 * used only in DEV and could be replaced by a static type checker for languages
	 * that support it.
	 */

	'use strict';

	var ReactCurrentOwner = __webpack_require__(14);
	var ReactComponentTreeHook = __webpack_require__(30);
	var ReactElement = __webpack_require__(13);

	var checkReactTypeSpec = __webpack_require__(31);

	var canDefineProperty = __webpack_require__(17);
	var getIteratorFn = __webpack_require__(20);
	var warning = __webpack_require__(15);

	function getDeclarationErrorAddendum() {
	  if (ReactCurrentOwner.current) {
	    var name = ReactCurrentOwner.current.getName();
	    if (name) {
	      return ' Check the render method of `' + name + '`.';
	    }
	  }
	  return '';
	}

	/**
	 * Warn if there's no key explicitly set on dynamic arrays of children or
	 * object keys are not valid. This allows us to keep track of children between
	 * updates.
	 */
	var ownerHasKeyUseWarning = {};

	function getCurrentComponentErrorInfo(parentType) {
	  var info = getDeclarationErrorAddendum();

	  if (!info) {
	    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
	    if (parentName) {
	      info = ' Check the top-level render call using <' + parentName + '>.';
	    }
	  }
	  return info;
	}

	/**
	 * Warn if the element doesn't have an explicit key assigned to it.
	 * This element is in an array. The array could grow and shrink or be
	 * reordered. All children that haven't already been validated are required to
	 * have a "key" property assigned to it. Error statuses are cached so a warning
	 * will only be shown once.
	 *
	 * @internal
	 * @param {ReactElement} element Element that requires a key.
	 * @param {*} parentType element's parent's type.
	 */
	function validateExplicitKey(element, parentType) {
	  if (!element._store || element._store.validated || element.key != null) {
	    return;
	  }
	  element._store.validated = true;

	  var memoizer = ownerHasKeyUseWarning.uniqueKey || (ownerHasKeyUseWarning.uniqueKey = {});

	  var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
	  if (memoizer[currentComponentErrorInfo]) {
	    return;
	  }
	  memoizer[currentComponentErrorInfo] = true;

	  // Usually the current owner is the offender, but if it accepts children as a
	  // property, it may be the creator of the child that's responsible for
	  // assigning it a key.
	  var childOwner = '';
	  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
	    // Give the component that originally created this child.
	    childOwner = ' It was passed a child from ' + element._owner.getName() + '.';
	  }

	  process.env.NODE_ENV !== 'production' ? warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.%s', currentComponentErrorInfo, childOwner, ReactComponentTreeHook.getCurrentStackAddendum(element)) : void 0;
	}

	/**
	 * Ensure that every element either is passed in a static location, in an
	 * array with an explicit keys property defined, or in an object literal
	 * with valid key property.
	 *
	 * @internal
	 * @param {ReactNode} node Statically passed child of any type.
	 * @param {*} parentType node's parent's type.
	 */
	function validateChildKeys(node, parentType) {
	  if (typeof node !== 'object') {
	    return;
	  }
	  if (Array.isArray(node)) {
	    for (var i = 0; i < node.length; i++) {
	      var child = node[i];
	      if (ReactElement.isValidElement(child)) {
	        validateExplicitKey(child, parentType);
	      }
	    }
	  } else if (ReactElement.isValidElement(node)) {
	    // This element was passed in a valid location.
	    if (node._store) {
	      node._store.validated = true;
	    }
	  } else if (node) {
	    var iteratorFn = getIteratorFn(node);
	    // Entry iterators provide implicit keys.
	    if (iteratorFn) {
	      if (iteratorFn !== node.entries) {
	        var iterator = iteratorFn.call(node);
	        var step;
	        while (!(step = iterator.next()).done) {
	          if (ReactElement.isValidElement(step.value)) {
	            validateExplicitKey(step.value, parentType);
	          }
	        }
	      }
	    }
	  }
	}

	/**
	 * Given an element, validate that its props follow the propTypes definition,
	 * provided by the type.
	 *
	 * @param {ReactElement} element
	 */
	function validatePropTypes(element) {
	  var componentClass = element.type;
	  if (typeof componentClass !== 'function') {
	    return;
	  }
	  var name = componentClass.displayName || componentClass.name;
	  if (componentClass.propTypes) {
	    checkReactTypeSpec(componentClass.propTypes, element.props, 'prop', name, element, null);
	  }
	  if (typeof componentClass.getDefaultProps === 'function') {
	    process.env.NODE_ENV !== 'production' ? warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : void 0;
	  }
	}

	var ReactElementValidator = {

	  createElement: function (type, props, children) {
	    var validType = typeof type === 'string' || typeof type === 'function';
	    // We warn in this case but don't throw. We expect the element creation to
	    // succeed and there will likely be errors in render.
	    if (!validType) {
	      if (typeof type !== 'function' && typeof type !== 'string') {
	        var info = '';
	        if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
	          info += ' You likely forgot to export your component from the file ' + 'it\'s defined in.';
	        }
	        info += getDeclarationErrorAddendum();
	        process.env.NODE_ENV !== 'production' ? warning(false, 'React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', type == null ? type : typeof type, info) : void 0;
	      }
	    }

	    var element = ReactElement.createElement.apply(this, arguments);

	    // The result can be nullish if a mock or a custom function is used.
	    // TODO: Drop this when these are no longer allowed as the type argument.
	    if (element == null) {
	      return element;
	    }

	    // Skip key warning if the type isn't valid since our key validation logic
	    // doesn't expect a non-string/function type and can throw confusing errors.
	    // We don't want exception behavior to differ between dev and prod.
	    // (Rendering will throw with a helpful message and as soon as the type is
	    // fixed, the key warnings will appear.)
	    if (validType) {
	      for (var i = 2; i < arguments.length; i++) {
	        validateChildKeys(arguments[i], type);
	      }
	    }

	    validatePropTypes(element);

	    return element;
	  },

	  createFactory: function (type) {
	    var validatedFactory = ReactElementValidator.createElement.bind(null, type);
	    // Legacy hook TODO: Warn if this is accessed
	    validatedFactory.type = type;

	    if (process.env.NODE_ENV !== 'production') {
	      if (canDefineProperty) {
	        Object.defineProperty(validatedFactory, 'type', {
	          enumerable: false,
	          get: function () {
	            process.env.NODE_ENV !== 'production' ? warning(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.') : void 0;
	            Object.defineProperty(this, 'type', {
	              value: type
	            });
	            return type;
	          }
	        });
	      }
	    }

	    return validatedFactory;
	  },

	  cloneElement: function (element, props, children) {
	    var newElement = ReactElement.cloneElement.apply(this, arguments);
	    for (var i = 2; i < arguments.length; i++) {
	      validateChildKeys(arguments[i], newElement.type);
	    }
	    validatePropTypes(newElement);
	    return newElement;
	  }

	};

	module.exports = ReactElementValidator;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2016-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var _prodInvariant = __webpack_require__(11);

	var ReactCurrentOwner = __webpack_require__(14);

	var invariant = __webpack_require__(12);
	var warning = __webpack_require__(15);

	function isNative(fn) {
	  // Based on isNative() from Lodash
	  var funcToString = Function.prototype.toString;
	  var hasOwnProperty = Object.prototype.hasOwnProperty;
	  var reIsNative = RegExp('^' + funcToString
	  // Take an example native function source for comparison
	  .call(hasOwnProperty)
	  // Strip regex characters so we can use it for regex
	  .replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  // Remove hasOwnProperty from the template to make it generic
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
	  try {
	    var source = funcToString.call(fn);
	    return reIsNative.test(source);
	  } catch (err) {
	    return false;
	  }
	}

	var canUseCollections =
	// Array.from
	typeof Array.from === 'function' &&
	// Map
	typeof Map === 'function' && isNative(Map) &&
	// Map.prototype.keys
	Map.prototype != null && typeof Map.prototype.keys === 'function' && isNative(Map.prototype.keys) &&
	// Set
	typeof Set === 'function' && isNative(Set) &&
	// Set.prototype.keys
	Set.prototype != null && typeof Set.prototype.keys === 'function' && isNative(Set.prototype.keys);

	var setItem;
	var getItem;
	var removeItem;
	var getItemIDs;
	var addRoot;
	var removeRoot;
	var getRootIDs;

	if (canUseCollections) {
	  var itemMap = new Map();
	  var rootIDSet = new Set();

	  setItem = function (id, item) {
	    itemMap.set(id, item);
	  };
	  getItem = function (id) {
	    return itemMap.get(id);
	  };
	  removeItem = function (id) {
	    itemMap['delete'](id);
	  };
	  getItemIDs = function () {
	    return Array.from(itemMap.keys());
	  };

	  addRoot = function (id) {
	    rootIDSet.add(id);
	  };
	  removeRoot = function (id) {
	    rootIDSet['delete'](id);
	  };
	  getRootIDs = function () {
	    return Array.from(rootIDSet.keys());
	  };
	} else {
	  var itemByKey = {};
	  var rootByKey = {};

	  // Use non-numeric keys to prevent V8 performance issues:
	  // https://github.com/facebook/react/pull/7232
	  var getKeyFromID = function (id) {
	    return '.' + id;
	  };
	  var getIDFromKey = function (key) {
	    return parseInt(key.substr(1), 10);
	  };

	  setItem = function (id, item) {
	    var key = getKeyFromID(id);
	    itemByKey[key] = item;
	  };
	  getItem = function (id) {
	    var key = getKeyFromID(id);
	    return itemByKey[key];
	  };
	  removeItem = function (id) {
	    var key = getKeyFromID(id);
	    delete itemByKey[key];
	  };
	  getItemIDs = function () {
	    return Object.keys(itemByKey).map(getIDFromKey);
	  };

	  addRoot = function (id) {
	    var key = getKeyFromID(id);
	    rootByKey[key] = true;
	  };
	  removeRoot = function (id) {
	    var key = getKeyFromID(id);
	    delete rootByKey[key];
	  };
	  getRootIDs = function () {
	    return Object.keys(rootByKey).map(getIDFromKey);
	  };
	}

	var unmountedIDs = [];

	function purgeDeep(id) {
	  var item = getItem(id);
	  if (item) {
	    var childIDs = item.childIDs;

	    removeItem(id);
	    childIDs.forEach(purgeDeep);
	  }
	}

	function describeComponentFrame(name, source, ownerName) {
	  return '\n    in ' + (name || 'Unknown') + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
	}

	function getDisplayName(element) {
	  if (element == null) {
	    return '#empty';
	  } else if (typeof element === 'string' || typeof element === 'number') {
	    return '#text';
	  } else if (typeof element.type === 'string') {
	    return element.type;
	  } else {
	    return element.type.displayName || element.type.name || 'Unknown';
	  }
	}

	function describeID(id) {
	  var name = ReactComponentTreeHook.getDisplayName(id);
	  var element = ReactComponentTreeHook.getElement(id);
	  var ownerID = ReactComponentTreeHook.getOwnerID(id);
	  var ownerName;
	  if (ownerID) {
	    ownerName = ReactComponentTreeHook.getDisplayName(ownerID);
	  }
	  process.env.NODE_ENV !== 'production' ? warning(element, 'ReactComponentTreeHook: Missing React element for debugID %s when ' + 'building stack', id) : void 0;
	  return describeComponentFrame(name, element && element._source, ownerName);
	}

	var ReactComponentTreeHook = {
	  onSetChildren: function (id, nextChildIDs) {
	    var item = getItem(id);
	    !item ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Item must have been set') : _prodInvariant('144') : void 0;
	    item.childIDs = nextChildIDs;

	    for (var i = 0; i < nextChildIDs.length; i++) {
	      var nextChildID = nextChildIDs[i];
	      var nextChild = getItem(nextChildID);
	      !nextChild ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected hook events to fire for the child before its parent includes it in onSetChildren().') : _prodInvariant('140') : void 0;
	      !(nextChild.childIDs != null || typeof nextChild.element !== 'object' || nextChild.element == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected onSetChildren() to fire for a container child before its parent includes it in onSetChildren().') : _prodInvariant('141') : void 0;
	      !nextChild.isMounted ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected onMountComponent() to fire for the child before its parent includes it in onSetChildren().') : _prodInvariant('71') : void 0;
	      if (nextChild.parentID == null) {
	        nextChild.parentID = id;
	        // TODO: This shouldn't be necessary but mounting a new root during in
	        // componentWillMount currently causes not-yet-mounted components to
	        // be purged from our tree data so their parent id is missing.
	      }
	      !(nextChild.parentID === id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected onBeforeMountComponent() parent and onSetChildren() to be consistent (%s has parents %s and %s).', nextChildID, nextChild.parentID, id) : _prodInvariant('142', nextChildID, nextChild.parentID, id) : void 0;
	    }
	  },
	  onBeforeMountComponent: function (id, element, parentID) {
	    var item = {
	      element: element,
	      parentID: parentID,
	      text: null,
	      childIDs: [],
	      isMounted: false,
	      updateCount: 0
	    };
	    setItem(id, item);
	  },
	  onBeforeUpdateComponent: function (id, element) {
	    var item = getItem(id);
	    if (!item || !item.isMounted) {
	      // We may end up here as a result of setState() in componentWillUnmount().
	      // In this case, ignore the element.
	      return;
	    }
	    item.element = element;
	  },
	  onMountComponent: function (id) {
	    var item = getItem(id);
	    !item ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Item must have been set') : _prodInvariant('144') : void 0;
	    item.isMounted = true;
	    var isRoot = item.parentID === 0;
	    if (isRoot) {
	      addRoot(id);
	    }
	  },
	  onUpdateComponent: function (id) {
	    var item = getItem(id);
	    if (!item || !item.isMounted) {
	      // We may end up here as a result of setState() in componentWillUnmount().
	      // In this case, ignore the element.
	      return;
	    }
	    item.updateCount++;
	  },
	  onUnmountComponent: function (id) {
	    var item = getItem(id);
	    if (item) {
	      // We need to check if it exists.
	      // `item` might not exist if it is inside an error boundary, and a sibling
	      // error boundary child threw while mounting. Then this instance never
	      // got a chance to mount, but it still gets an unmounting event during
	      // the error boundary cleanup.
	      item.isMounted = false;
	      var isRoot = item.parentID === 0;
	      if (isRoot) {
	        removeRoot(id);
	      }
	    }
	    unmountedIDs.push(id);
	  },
	  purgeUnmountedComponents: function () {
	    if (ReactComponentTreeHook._preventPurging) {
	      // Should only be used for testing.
	      return;
	    }

	    for (var i = 0; i < unmountedIDs.length; i++) {
	      var id = unmountedIDs[i];
	      purgeDeep(id);
	    }
	    unmountedIDs.length = 0;
	  },
	  isMounted: function (id) {
	    var item = getItem(id);
	    return item ? item.isMounted : false;
	  },
	  getCurrentStackAddendum: function (topElement) {
	    var info = '';
	    if (topElement) {
	      var name = getDisplayName(topElement);
	      var owner = topElement._owner;
	      info += describeComponentFrame(name, topElement._source, owner && owner.getName());
	    }

	    var currentOwner = ReactCurrentOwner.current;
	    var id = currentOwner && currentOwner._debugID;

	    info += ReactComponentTreeHook.getStackAddendumByID(id);
	    return info;
	  },
	  getStackAddendumByID: function (id) {
	    var info = '';
	    while (id) {
	      info += describeID(id);
	      id = ReactComponentTreeHook.getParentID(id);
	    }
	    return info;
	  },
	  getChildIDs: function (id) {
	    var item = getItem(id);
	    return item ? item.childIDs : [];
	  },
	  getDisplayName: function (id) {
	    var element = ReactComponentTreeHook.getElement(id);
	    if (!element) {
	      return null;
	    }
	    return getDisplayName(element);
	  },
	  getElement: function (id) {
	    var item = getItem(id);
	    return item ? item.element : null;
	  },
	  getOwnerID: function (id) {
	    var element = ReactComponentTreeHook.getElement(id);
	    if (!element || !element._owner) {
	      return null;
	    }
	    return element._owner._debugID;
	  },
	  getParentID: function (id) {
	    var item = getItem(id);
	    return item ? item.parentID : null;
	  },
	  getSource: function (id) {
	    var item = getItem(id);
	    var element = item ? item.element : null;
	    var source = element != null ? element._source : null;
	    return source;
	  },
	  getText: function (id) {
	    var element = ReactComponentTreeHook.getElement(id);
	    if (typeof element === 'string') {
	      return element;
	    } else if (typeof element === 'number') {
	      return '' + element;
	    } else {
	      return null;
	    }
	  },
	  getUpdateCount: function (id) {
	    var item = getItem(id);
	    return item ? item.updateCount : 0;
	  },


	  getRootIDs: getRootIDs,
	  getRegisteredIDs: getItemIDs
	};

	module.exports = ReactComponentTreeHook;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var _prodInvariant = __webpack_require__(11);

	var ReactPropTypeLocationNames = __webpack_require__(27);
	var ReactPropTypesSecret = __webpack_require__(32);

	var invariant = __webpack_require__(12);
	var warning = __webpack_require__(15);

	var ReactComponentTreeHook;

	if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
	  // Temporary hack.
	  // Inline requires don't work well with Jest:
	  // https://github.com/facebook/react/issues/7240
	  // Remove the inline requires when we don't need them anymore:
	  // https://github.com/facebook/react/pull/7178
	  ReactComponentTreeHook = __webpack_require__(30);
	}

	var loggedTypeFailures = {};

	/**
	 * Assert that the values match with the type specs.
	 * Error messages are memorized and will only be shown once.
	 *
	 * @param {object} typeSpecs Map of name to a ReactPropType
	 * @param {object} values Runtime values that need to be type-checked
	 * @param {string} location e.g. "prop", "context", "child context"
	 * @param {string} componentName Name of the component for error messages.
	 * @param {?object} element The React element that is being type-checked
	 * @param {?number} debugID The React component instance that is being type-checked
	 * @private
	 */
	function checkReactTypeSpec(typeSpecs, values, location, componentName, element, debugID) {
	  for (var typeSpecName in typeSpecs) {
	    if (typeSpecs.hasOwnProperty(typeSpecName)) {
	      var error;
	      // Prop type validation may throw. In case they do, we don't want to
	      // fail the render phase where it didn't fail before. So we log it.
	      // After these have been cleaned up, we'll let them throw.
	      try {
	        // This is intentionally an invariant that gets caught. It's the same
	        // behavior as without this statement except with a better message.
	        !(typeof typeSpecs[typeSpecName] === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: %s type `%s` is invalid; it must be a function, usually from React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], typeSpecName) : _prodInvariant('84', componentName || 'React class', ReactPropTypeLocationNames[location], typeSpecName) : void 0;
	        error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
	      } catch (ex) {
	        error = ex;
	      }
	      process.env.NODE_ENV !== 'production' ? warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', ReactPropTypeLocationNames[location], typeSpecName, typeof error) : void 0;
	      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
	        // Only monitor this failure once because there tends to be a lot of the
	        // same error.
	        loggedTypeFailures[error.message] = true;

	        var componentStackInfo = '';

	        if (process.env.NODE_ENV !== 'production') {
	          if (!ReactComponentTreeHook) {
	            ReactComponentTreeHook = __webpack_require__(30);
	          }
	          if (debugID !== null) {
	            componentStackInfo = ReactComponentTreeHook.getStackAddendumByID(debugID);
	          } else if (element !== null) {
	            componentStackInfo = ReactComponentTreeHook.getCurrentStackAddendum(element);
	          }
	        }

	        process.env.NODE_ENV !== 'production' ? warning(false, 'Failed %s type: %s%s', location, error.message, componentStackInfo) : void 0;
	      }
	    }
	  }
	}

	module.exports = checkReactTypeSpec;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 32 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

	module.exports = ReactPropTypesSecret;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	var ReactElement = __webpack_require__(13);
	var ReactPropTypeLocationNames = __webpack_require__(27);
	var ReactPropTypesSecret = __webpack_require__(32);

	var emptyFunction = __webpack_require__(16);
	var getIteratorFn = __webpack_require__(20);
	var warning = __webpack_require__(15);

	/**
	 * Collection of methods that allow declaration and validation of props that are
	 * supplied to React components. Example usage:
	 *
	 *   var Props = require('ReactPropTypes');
	 *   var MyArticle = React.createClass({
	 *     propTypes: {
	 *       // An optional string prop named "description".
	 *       description: Props.string,
	 *
	 *       // A required enum prop named "category".
	 *       category: Props.oneOf(['News','Photos']).isRequired,
	 *
	 *       // A prop named "dialog" that requires an instance of Dialog.
	 *       dialog: Props.instanceOf(Dialog).isRequired
	 *     },
	 *     render: function() { ... }
	 *   });
	 *
	 * A more formal specification of how these methods are used:
	 *
	 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
	 *   decl := ReactPropTypes.{type}(.isRequired)?
	 *
	 * Each and every declaration produces a function with the same signature. This
	 * allows the creation of custom validation functions. For example:
	 *
	 *  var MyLink = React.createClass({
	 *    propTypes: {
	 *      // An optional string or URI prop named "href".
	 *      href: function(props, propName, componentName) {
	 *        var propValue = props[propName];
	 *        if (propValue != null && typeof propValue !== 'string' &&
	 *            !(propValue instanceof URI)) {
	 *          return new Error(
	 *            'Expected a string or an URI for ' + propName + ' in ' +
	 *            componentName
	 *          );
	 *        }
	 *      }
	 *    },
	 *    render: function() {...}
	 *  });
	 *
	 * @internal
	 */

	var ANONYMOUS = '<<anonymous>>';

	var ReactPropTypes = {
	  array: createPrimitiveTypeChecker('array'),
	  bool: createPrimitiveTypeChecker('boolean'),
	  func: createPrimitiveTypeChecker('function'),
	  number: createPrimitiveTypeChecker('number'),
	  object: createPrimitiveTypeChecker('object'),
	  string: createPrimitiveTypeChecker('string'),
	  symbol: createPrimitiveTypeChecker('symbol'),

	  any: createAnyTypeChecker(),
	  arrayOf: createArrayOfTypeChecker,
	  element: createElementTypeChecker(),
	  instanceOf: createInstanceTypeChecker,
	  node: createNodeChecker(),
	  objectOf: createObjectOfTypeChecker,
	  oneOf: createEnumTypeChecker,
	  oneOfType: createUnionTypeChecker,
	  shape: createShapeTypeChecker
	};

	/**
	 * inlined Object.is polyfill to avoid requiring consumers ship their own
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
	 */
	/*eslint-disable no-self-compare*/
	function is(x, y) {
	  // SameValue algorithm
	  if (x === y) {
	    // Steps 1-5, 7-10
	    // Steps 6.b-6.e: +0 != -0
	    return x !== 0 || 1 / x === 1 / y;
	  } else {
	    // Step 6.a: NaN == NaN
	    return x !== x && y !== y;
	  }
	}
	/*eslint-enable no-self-compare*/

	/**
	 * We use an Error-like object for backward compatibility as people may call
	 * PropTypes directly and inspect their output. However we don't use real
	 * Errors anymore. We don't inspect their stack anyway, and creating them
	 * is prohibitively expensive if they are created too often, such as what
	 * happens in oneOfType() for any type before the one that matched.
	 */
	function PropTypeError(message) {
	  this.message = message;
	  this.stack = '';
	}
	// Make `instanceof Error` still work for returned errors.
	PropTypeError.prototype = Error.prototype;

	function createChainableTypeChecker(validate) {
	  if (process.env.NODE_ENV !== 'production') {
	    var manualPropTypeCallCache = {};
	  }
	  function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
	    componentName = componentName || ANONYMOUS;
	    propFullName = propFullName || propName;
	    if (process.env.NODE_ENV !== 'production') {
	      if (secret !== ReactPropTypesSecret && typeof console !== 'undefined') {
	        var cacheKey = componentName + ':' + propName;
	        if (!manualPropTypeCallCache[cacheKey]) {
	          process.env.NODE_ENV !== 'production' ? warning(false, 'You are manually calling a React.PropTypes validation ' + 'function for the `%s` prop on `%s`. This is deprecated ' + 'and will not work in production with the next major version. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.', propFullName, componentName) : void 0;
	          manualPropTypeCallCache[cacheKey] = true;
	        }
	      }
	    }
	    if (props[propName] == null) {
	      var locationName = ReactPropTypeLocationNames[location];
	      if (isRequired) {
	        if (props[propName] === null) {
	          return new PropTypeError('The ' + locationName + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
	        }
	        return new PropTypeError('The ' + locationName + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
	      }
	      return null;
	    } else {
	      return validate(props, propName, componentName, location, propFullName);
	    }
	  }

	  var chainedCheckType = checkType.bind(null, false);
	  chainedCheckType.isRequired = checkType.bind(null, true);

	  return chainedCheckType;
	}

	function createPrimitiveTypeChecker(expectedType) {
	  function validate(props, propName, componentName, location, propFullName, secret) {
	    var propValue = props[propName];
	    var propType = getPropType(propValue);
	    if (propType !== expectedType) {
	      var locationName = ReactPropTypeLocationNames[location];
	      // `propValue` being instance of, say, date/regexp, pass the 'object'
	      // check, but we can offer a more precise error message here rather than
	      // 'of type `object`'.
	      var preciseType = getPreciseType(propValue);

	      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
	    }
	    return null;
	  }
	  return createChainableTypeChecker(validate);
	}

	function createAnyTypeChecker() {
	  return createChainableTypeChecker(emptyFunction.thatReturns(null));
	}

	function createArrayOfTypeChecker(typeChecker) {
	  function validate(props, propName, componentName, location, propFullName) {
	    if (typeof typeChecker !== 'function') {
	      return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
	    }
	    var propValue = props[propName];
	    if (!Array.isArray(propValue)) {
	      var locationName = ReactPropTypeLocationNames[location];
	      var propType = getPropType(propValue);
	      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
	    }
	    for (var i = 0; i < propValue.length; i++) {
	      var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
	      if (error instanceof Error) {
	        return error;
	      }
	    }
	    return null;
	  }
	  return createChainableTypeChecker(validate);
	}

	function createElementTypeChecker() {
	  function validate(props, propName, componentName, location, propFullName) {
	    var propValue = props[propName];
	    if (!ReactElement.isValidElement(propValue)) {
	      var locationName = ReactPropTypeLocationNames[location];
	      var propType = getPropType(propValue);
	      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
	    }
	    return null;
	  }
	  return createChainableTypeChecker(validate);
	}

	function createInstanceTypeChecker(expectedClass) {
	  function validate(props, propName, componentName, location, propFullName) {
	    if (!(props[propName] instanceof expectedClass)) {
	      var locationName = ReactPropTypeLocationNames[location];
	      var expectedClassName = expectedClass.name || ANONYMOUS;
	      var actualClassName = getClassName(props[propName]);
	      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
	    }
	    return null;
	  }
	  return createChainableTypeChecker(validate);
	}

	function createEnumTypeChecker(expectedValues) {
	  if (!Array.isArray(expectedValues)) {
	    process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
	    return emptyFunction.thatReturnsNull;
	  }

	  function validate(props, propName, componentName, location, propFullName) {
	    var propValue = props[propName];
	    for (var i = 0; i < expectedValues.length; i++) {
	      if (is(propValue, expectedValues[i])) {
	        return null;
	      }
	    }

	    var locationName = ReactPropTypeLocationNames[location];
	    var valuesString = JSON.stringify(expectedValues);
	    return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
	  }
	  return createChainableTypeChecker(validate);
	}

	function createObjectOfTypeChecker(typeChecker) {
	  function validate(props, propName, componentName, location, propFullName) {
	    if (typeof typeChecker !== 'function') {
	      return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
	    }
	    var propValue = props[propName];
	    var propType = getPropType(propValue);
	    if (propType !== 'object') {
	      var locationName = ReactPropTypeLocationNames[location];
	      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
	    }
	    for (var key in propValue) {
	      if (propValue.hasOwnProperty(key)) {
	        var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
	        if (error instanceof Error) {
	          return error;
	        }
	      }
	    }
	    return null;
	  }
	  return createChainableTypeChecker(validate);
	}

	function createUnionTypeChecker(arrayOfTypeCheckers) {
	  if (!Array.isArray(arrayOfTypeCheckers)) {
	    process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
	    return emptyFunction.thatReturnsNull;
	  }

	  function validate(props, propName, componentName, location, propFullName) {
	    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
	      var checker = arrayOfTypeCheckers[i];
	      if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
	        return null;
	      }
	    }

	    var locationName = ReactPropTypeLocationNames[location];
	    return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
	  }
	  return createChainableTypeChecker(validate);
	}

	function createNodeChecker() {
	  function validate(props, propName, componentName, location, propFullName) {
	    if (!isNode(props[propName])) {
	      var locationName = ReactPropTypeLocationNames[location];
	      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
	    }
	    return null;
	  }
	  return createChainableTypeChecker(validate);
	}

	function createShapeTypeChecker(shapeTypes) {
	  function validate(props, propName, componentName, location, propFullName) {
	    var propValue = props[propName];
	    var propType = getPropType(propValue);
	    if (propType !== 'object') {
	      var locationName = ReactPropTypeLocationNames[location];
	      return new PropTypeError('Invalid ' + locationName + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
	    }
	    for (var key in shapeTypes) {
	      var checker = shapeTypes[key];
	      if (!checker) {
	        continue;
	      }
	      var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
	      if (error) {
	        return error;
	      }
	    }
	    return null;
	  }
	  return createChainableTypeChecker(validate);
	}

	function isNode(propValue) {
	  switch (typeof propValue) {
	    case 'number':
	    case 'string':
	    case 'undefined':
	      return true;
	    case 'boolean':
	      return !propValue;
	    case 'object':
	      if (Array.isArray(propValue)) {
	        return propValue.every(isNode);
	      }
	      if (propValue === null || ReactElement.isValidElement(propValue)) {
	        return true;
	      }

	      var iteratorFn = getIteratorFn(propValue);
	      if (iteratorFn) {
	        var iterator = iteratorFn.call(propValue);
	        var step;
	        if (iteratorFn !== propValue.entries) {
	          while (!(step = iterator.next()).done) {
	            if (!isNode(step.value)) {
	              return false;
	            }
	          }
	        } else {
	          // Iterator will provide entry [k,v] tuples rather than values.
	          while (!(step = iterator.next()).done) {
	            var entry = step.value;
	            if (entry) {
	              if (!isNode(entry[1])) {
	                return false;
	              }
	            }
	          }
	        }
	      } else {
	        return false;
	      }

	      return true;
	    default:
	      return false;
	  }
	}

	function isSymbol(propType, propValue) {
	  // Native Symbol.
	  if (propType === 'symbol') {
	    return true;
	  }

	  // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
	  if (propValue['@@toStringTag'] === 'Symbol') {
	    return true;
	  }

	  // Fallback for non-spec compliant Symbols which are polyfilled.
	  if (typeof Symbol === 'function' && propValue instanceof Symbol) {
	    return true;
	  }

	  return false;
	}

	// Equivalent of `typeof` but with special handling for array and regexp.
	function getPropType(propValue) {
	  var propType = typeof propValue;
	  if (Array.isArray(propValue)) {
	    return 'array';
	  }
	  if (propValue instanceof RegExp) {
	    // Old webkits (at least until Android 4.0) return 'function' rather than
	    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
	    // passes PropTypes.object.
	    return 'object';
	  }
	  if (isSymbol(propType, propValue)) {
	    return 'symbol';
	  }
	  return propType;
	}

	// This handles more types than `getPropType`. Only used for error messages.
	// See `createPrimitiveTypeChecker`.
	function getPreciseType(propValue) {
	  var propType = getPropType(propValue);
	  if (propType === 'object') {
	    if (propValue instanceof Date) {
	      return 'date';
	    } else if (propValue instanceof RegExp) {
	      return 'regexp';
	    }
	  }
	  return propType;
	}

	// Returns class name of the object, if any.
	function getClassName(propValue) {
	  if (!propValue.constructor || !propValue.constructor.name) {
	    return ANONYMOUS;
	  }
	  return propValue.constructor.name;
	}

	module.exports = ReactPropTypes;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 34 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	'use strict';

	module.exports = '15.4.2';

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	'use strict';

	var _prodInvariant = __webpack_require__(11);

	var ReactElement = __webpack_require__(13);

	var invariant = __webpack_require__(12);

	/**
	 * Returns the first child in a collection of children and verifies that there
	 * is only one child in the collection.
	 *
	 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.only
	 *
	 * The current implementation of this function assumes that a single child gets
	 * passed without a wrapper, but the purpose of this helper function is to
	 * abstract away the particular structure of children.
	 *
	 * @param {?object} children Child collection structure.
	 * @return {ReactElement} The first and only `ReactElement` contained in the
	 * structure.
	 */
	function onlyChild(children) {
	  !ReactElement.isValidElement(children) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'React.Children.only expected to receive a single React element child.') : _prodInvariant('143') : void 0;
	  return children;
	}

	module.exports = onlyChild;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.connect = exports.Provider = undefined;

	var _Provider = __webpack_require__(37);

	var _Provider2 = _interopRequireDefault(_Provider);

	var _connect = __webpack_require__(40);

	var _connect2 = _interopRequireDefault(_connect);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	exports.Provider = _Provider2["default"];
	exports.connect = _connect2["default"];

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports["default"] = undefined;

	var _react = __webpack_require__(5);

	var _storeShape = __webpack_require__(38);

	var _storeShape2 = _interopRequireDefault(_storeShape);

	var _warning = __webpack_require__(39);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var didWarnAboutReceivingStore = false;
	function warnAboutReceivingStore() {
	  if (didWarnAboutReceivingStore) {
	    return;
	  }
	  didWarnAboutReceivingStore = true;

	  (0, _warning2["default"])('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/reactjs/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
	}

	var Provider = function (_Component) {
	  _inherits(Provider, _Component);

	  Provider.prototype.getChildContext = function getChildContext() {
	    return { store: this.store };
	  };

	  function Provider(props, context) {
	    _classCallCheck(this, Provider);

	    var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

	    _this.store = props.store;
	    return _this;
	  }

	  Provider.prototype.render = function render() {
	    return _react.Children.only(this.props.children);
	  };

	  return Provider;
	}(_react.Component);

	exports["default"] = Provider;


	if (process.env.NODE_ENV !== 'production') {
	  Provider.prototype.componentWillReceiveProps = function (nextProps) {
	    var store = this.store;
	    var nextStore = nextProps.store;


	    if (store !== nextStore) {
	      warnAboutReceivingStore();
	    }
	  };
	}

	Provider.propTypes = {
	  store: _storeShape2["default"].isRequired,
	  children: _react.PropTypes.element.isRequired
	};
	Provider.childContextTypes = {
	  store: _storeShape2["default"].isRequired
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _react = __webpack_require__(5);

	exports["default"] = _react.PropTypes.shape({
	  subscribe: _react.PropTypes.func.isRequired,
	  dispatch: _react.PropTypes.func.isRequired,
	  getState: _react.PropTypes.func.isRequired
	});

/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports["default"] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports["default"] = connect;

	var _react = __webpack_require__(5);

	var _storeShape = __webpack_require__(38);

	var _storeShape2 = _interopRequireDefault(_storeShape);

	var _shallowEqual = __webpack_require__(41);

	var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

	var _wrapActionCreators = __webpack_require__(42);

	var _wrapActionCreators2 = _interopRequireDefault(_wrapActionCreators);

	var _warning = __webpack_require__(39);

	var _warning2 = _interopRequireDefault(_warning);

	var _isPlainObject = __webpack_require__(45);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _hoistNonReactStatics = __webpack_require__(64);

	var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

	var _invariant = __webpack_require__(65);

	var _invariant2 = _interopRequireDefault(_invariant);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var defaultMapStateToProps = function defaultMapStateToProps(state) {
	  return {};
	}; // eslint-disable-line no-unused-vars
	var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
	  return { dispatch: dispatch };
	};
	var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
	  return _extends({}, parentProps, stateProps, dispatchProps);
	};

	function getDisplayName(WrappedComponent) {
	  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
	}

	var errorObject = { value: null };
	function tryCatch(fn, ctx) {
	  try {
	    return fn.apply(ctx);
	  } catch (e) {
	    errorObject.value = e;
	    return errorObject;
	  }
	}

	// Helps track hot reloading.
	var nextVersion = 0;

	function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
	  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	  var shouldSubscribe = Boolean(mapStateToProps);
	  var mapState = mapStateToProps || defaultMapStateToProps;

	  var mapDispatch = void 0;
	  if (typeof mapDispatchToProps === 'function') {
	    mapDispatch = mapDispatchToProps;
	  } else if (!mapDispatchToProps) {
	    mapDispatch = defaultMapDispatchToProps;
	  } else {
	    mapDispatch = (0, _wrapActionCreators2["default"])(mapDispatchToProps);
	  }

	  var finalMergeProps = mergeProps || defaultMergeProps;
	  var _options$pure = options.pure,
	      pure = _options$pure === undefined ? true : _options$pure,
	      _options$withRef = options.withRef,
	      withRef = _options$withRef === undefined ? false : _options$withRef;

	  var checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;

	  // Helps track hot reloading.
	  var version = nextVersion++;

	  return function wrapWithConnect(WrappedComponent) {
	    var connectDisplayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';

	    function checkStateShape(props, methodName) {
	      if (!(0, _isPlainObject2["default"])(props)) {
	        (0, _warning2["default"])(methodName + '() in ' + connectDisplayName + ' must return a plain object. ' + ('Instead received ' + props + '.'));
	      }
	    }

	    function computeMergedProps(stateProps, dispatchProps, parentProps) {
	      var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
	      if (process.env.NODE_ENV !== 'production') {
	        checkStateShape(mergedProps, 'mergeProps');
	      }
	      return mergedProps;
	    }

	    var Connect = function (_Component) {
	      _inherits(Connect, _Component);

	      Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
	        return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
	      };

	      function Connect(props, context) {
	        _classCallCheck(this, Connect);

	        var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

	        _this.version = version;
	        _this.store = props.store || context.store;

	        (0, _invariant2["default"])(_this.store, 'Could not find "store" in either the context or ' + ('props of "' + connectDisplayName + '". ') + 'Either wrap the root component in a <Provider>, ' + ('or explicitly pass "store" as a prop to "' + connectDisplayName + '".'));

	        var storeState = _this.store.getState();
	        _this.state = { storeState: storeState };
	        _this.clearCache();
	        return _this;
	      }

	      Connect.prototype.computeStateProps = function computeStateProps(store, props) {
	        if (!this.finalMapStateToProps) {
	          return this.configureFinalMapState(store, props);
	        }

	        var state = store.getState();
	        var stateProps = this.doStatePropsDependOnOwnProps ? this.finalMapStateToProps(state, props) : this.finalMapStateToProps(state);

	        if (process.env.NODE_ENV !== 'production') {
	          checkStateShape(stateProps, 'mapStateToProps');
	        }
	        return stateProps;
	      };

	      Connect.prototype.configureFinalMapState = function configureFinalMapState(store, props) {
	        var mappedState = mapState(store.getState(), props);
	        var isFactory = typeof mappedState === 'function';

	        this.finalMapStateToProps = isFactory ? mappedState : mapState;
	        this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;

	        if (isFactory) {
	          return this.computeStateProps(store, props);
	        }

	        if (process.env.NODE_ENV !== 'production') {
	          checkStateShape(mappedState, 'mapStateToProps');
	        }
	        return mappedState;
	      };

	      Connect.prototype.computeDispatchProps = function computeDispatchProps(store, props) {
	        if (!this.finalMapDispatchToProps) {
	          return this.configureFinalMapDispatch(store, props);
	        }

	        var dispatch = store.dispatch;

	        var dispatchProps = this.doDispatchPropsDependOnOwnProps ? this.finalMapDispatchToProps(dispatch, props) : this.finalMapDispatchToProps(dispatch);

	        if (process.env.NODE_ENV !== 'production') {
	          checkStateShape(dispatchProps, 'mapDispatchToProps');
	        }
	        return dispatchProps;
	      };

	      Connect.prototype.configureFinalMapDispatch = function configureFinalMapDispatch(store, props) {
	        var mappedDispatch = mapDispatch(store.dispatch, props);
	        var isFactory = typeof mappedDispatch === 'function';

	        this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch;
	        this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1;

	        if (isFactory) {
	          return this.computeDispatchProps(store, props);
	        }

	        if (process.env.NODE_ENV !== 'production') {
	          checkStateShape(mappedDispatch, 'mapDispatchToProps');
	        }
	        return mappedDispatch;
	      };

	      Connect.prototype.updateStatePropsIfNeeded = function updateStatePropsIfNeeded() {
	        var nextStateProps = this.computeStateProps(this.store, this.props);
	        if (this.stateProps && (0, _shallowEqual2["default"])(nextStateProps, this.stateProps)) {
	          return false;
	        }

	        this.stateProps = nextStateProps;
	        return true;
	      };

	      Connect.prototype.updateDispatchPropsIfNeeded = function updateDispatchPropsIfNeeded() {
	        var nextDispatchProps = this.computeDispatchProps(this.store, this.props);
	        if (this.dispatchProps && (0, _shallowEqual2["default"])(nextDispatchProps, this.dispatchProps)) {
	          return false;
	        }

	        this.dispatchProps = nextDispatchProps;
	        return true;
	      };

	      Connect.prototype.updateMergedPropsIfNeeded = function updateMergedPropsIfNeeded() {
	        var nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);
	        if (this.mergedProps && checkMergedEquals && (0, _shallowEqual2["default"])(nextMergedProps, this.mergedProps)) {
	          return false;
	        }

	        this.mergedProps = nextMergedProps;
	        return true;
	      };

	      Connect.prototype.isSubscribed = function isSubscribed() {
	        return typeof this.unsubscribe === 'function';
	      };

	      Connect.prototype.trySubscribe = function trySubscribe() {
	        if (shouldSubscribe && !this.unsubscribe) {
	          this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
	          this.handleChange();
	        }
	      };

	      Connect.prototype.tryUnsubscribe = function tryUnsubscribe() {
	        if (this.unsubscribe) {
	          this.unsubscribe();
	          this.unsubscribe = null;
	        }
	      };

	      Connect.prototype.componentDidMount = function componentDidMount() {
	        this.trySubscribe();
	      };

	      Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	        if (!pure || !(0, _shallowEqual2["default"])(nextProps, this.props)) {
	          this.haveOwnPropsChanged = true;
	        }
	      };

	      Connect.prototype.componentWillUnmount = function componentWillUnmount() {
	        this.tryUnsubscribe();
	        this.clearCache();
	      };

	      Connect.prototype.clearCache = function clearCache() {
	        this.dispatchProps = null;
	        this.stateProps = null;
	        this.mergedProps = null;
	        this.haveOwnPropsChanged = true;
	        this.hasStoreStateChanged = true;
	        this.haveStatePropsBeenPrecalculated = false;
	        this.statePropsPrecalculationError = null;
	        this.renderedElement = null;
	        this.finalMapDispatchToProps = null;
	        this.finalMapStateToProps = null;
	      };

	      Connect.prototype.handleChange = function handleChange() {
	        if (!this.unsubscribe) {
	          return;
	        }

	        var storeState = this.store.getState();
	        var prevStoreState = this.state.storeState;
	        if (pure && prevStoreState === storeState) {
	          return;
	        }

	        if (pure && !this.doStatePropsDependOnOwnProps) {
	          var haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
	          if (!haveStatePropsChanged) {
	            return;
	          }
	          if (haveStatePropsChanged === errorObject) {
	            this.statePropsPrecalculationError = errorObject.value;
	          }
	          this.haveStatePropsBeenPrecalculated = true;
	        }

	        this.hasStoreStateChanged = true;
	        this.setState({ storeState: storeState });
	      };

	      Connect.prototype.getWrappedInstance = function getWrappedInstance() {
	        (0, _invariant2["default"])(withRef, 'To access the wrapped instance, you need to specify ' + '{ withRef: true } as the fourth argument of the connect() call.');

	        return this.refs.wrappedInstance;
	      };

	      Connect.prototype.render = function render() {
	        var haveOwnPropsChanged = this.haveOwnPropsChanged,
	            hasStoreStateChanged = this.hasStoreStateChanged,
	            haveStatePropsBeenPrecalculated = this.haveStatePropsBeenPrecalculated,
	            statePropsPrecalculationError = this.statePropsPrecalculationError,
	            renderedElement = this.renderedElement;


	        this.haveOwnPropsChanged = false;
	        this.hasStoreStateChanged = false;
	        this.haveStatePropsBeenPrecalculated = false;
	        this.statePropsPrecalculationError = null;

	        if (statePropsPrecalculationError) {
	          throw statePropsPrecalculationError;
	        }

	        var shouldUpdateStateProps = true;
	        var shouldUpdateDispatchProps = true;
	        if (pure && renderedElement) {
	          shouldUpdateStateProps = hasStoreStateChanged || haveOwnPropsChanged && this.doStatePropsDependOnOwnProps;
	          shouldUpdateDispatchProps = haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps;
	        }

	        var haveStatePropsChanged = false;
	        var haveDispatchPropsChanged = false;
	        if (haveStatePropsBeenPrecalculated) {
	          haveStatePropsChanged = true;
	        } else if (shouldUpdateStateProps) {
	          haveStatePropsChanged = this.updateStatePropsIfNeeded();
	        }
	        if (shouldUpdateDispatchProps) {
	          haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
	        }

	        var haveMergedPropsChanged = true;
	        if (haveStatePropsChanged || haveDispatchPropsChanged || haveOwnPropsChanged) {
	          haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
	        } else {
	          haveMergedPropsChanged = false;
	        }

	        if (!haveMergedPropsChanged && renderedElement) {
	          return renderedElement;
	        }

	        if (withRef) {
	          this.renderedElement = (0, _react.createElement)(WrappedComponent, _extends({}, this.mergedProps, {
	            ref: 'wrappedInstance'
	          }));
	        } else {
	          this.renderedElement = (0, _react.createElement)(WrappedComponent, this.mergedProps);
	        }

	        return this.renderedElement;
	      };

	      return Connect;
	    }(_react.Component);

	    Connect.displayName = connectDisplayName;
	    Connect.WrappedComponent = WrappedComponent;
	    Connect.contextTypes = {
	      store: _storeShape2["default"]
	    };
	    Connect.propTypes = {
	      store: _storeShape2["default"]
	    };

	    if (process.env.NODE_ENV !== 'production') {
	      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
	        if (this.version === version) {
	          return;
	        }

	        // We are hot reloading!
	        this.version = version;
	        this.trySubscribe();
	        this.clearCache();
	      };
	    }

	    return (0, _hoistNonReactStatics2["default"])(Connect, WrappedComponent);
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = shallowEqual;
	function shallowEqual(objA, objB) {
	  if (objA === objB) {
	    return true;
	  }

	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);

	  if (keysA.length !== keysB.length) {
	    return false;
	  }

	  // Test for A's keys different from B.
	  var hasOwn = Object.prototype.hasOwnProperty;
	  for (var i = 0; i < keysA.length; i++) {
	    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
	      return false;
	    }
	  }

	  return true;
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports["default"] = wrapActionCreators;

	var _redux = __webpack_require__(43);

	function wrapActionCreators(actionCreators) {
	  return function (dispatch) {
	    return (0, _redux.bindActionCreators)(actionCreators, dispatch);
	  };
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

	var _createStore = __webpack_require__(44);

	var _createStore2 = _interopRequireDefault(_createStore);

	var _combineReducers = __webpack_require__(59);

	var _combineReducers2 = _interopRequireDefault(_combineReducers);

	var _bindActionCreators = __webpack_require__(61);

	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

	var _applyMiddleware = __webpack_require__(62);

	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

	var _compose = __webpack_require__(63);

	var _compose2 = _interopRequireDefault(_compose);

	var _warning = __webpack_require__(60);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}

	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}

	exports.createStore = _createStore2['default'];
	exports.combineReducers = _combineReducers2['default'];
	exports.bindActionCreators = _bindActionCreators2['default'];
	exports.applyMiddleware = _applyMiddleware2['default'];
	exports.compose = _compose2['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.ActionTypes = undefined;
	exports['default'] = createStore;

	var _isPlainObject = __webpack_require__(45);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _symbolObservable = __webpack_require__(55);

	var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = exports.ActionTypes = {
	  INIT: '@@redux/INIT'
	};

	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [preloadedState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} enhancer The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, preloadedState, enhancer) {
	  var _ref2;

	  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = preloadedState;
	    preloadedState = undefined;
	  }

	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }

	    return enhancer(createStore)(reducer, preloadedState);
	  }

	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }

	  var currentReducer = reducer;
	  var currentState = preloadedState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;

	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }

	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }

	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }

	    var isSubscribed = true;

	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);

	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }

	      isSubscribed = false;

	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }

	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2['default'])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }

	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }

	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }

	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }

	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }

	    return action;
	  }

	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }

	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }

	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/zenparsing/es-observable
	   */
	  function observable() {
	    var _ref;

	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */
	      subscribe: function subscribe(observer) {
	        if (typeof observer !== 'object') {
	          throw new TypeError('Expected the observer to be an object.');
	        }

	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }

	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return { unsubscribe: unsubscribe };
	      }
	    }, _ref[_symbolObservable2['default']] = function () {
	      return this;
	    }, _ref;
	  }

	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });

	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
	}

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(46),
	    getPrototype = __webpack_require__(52),
	    isObjectLike = __webpack_require__(54);

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
	    funcToString.call(Ctor) == objectCtorString;
	}

	module.exports = isPlainObject;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(47),
	    getRawTag = __webpack_require__(50),
	    objectToString = __webpack_require__(51);

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	module.exports = baseGetTag;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var root = __webpack_require__(48);

	/** Built-in value references. */
	var Symbol = root.Symbol;

	module.exports = Symbol;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var freeGlobal = __webpack_require__(49);

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	module.exports = root;


/***/ },
/* 49 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	module.exports = freeGlobal;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(47);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

	module.exports = getRawTag;


/***/ },
/* 51 */
/***/ function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}

	module.exports = objectToString;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(53);

	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

	module.exports = getPrototype;


/***/ },
/* 53 */
/***/ function(module, exports) {

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	module.exports = overArg;


/***/ },
/* 54 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(56);


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _ponyfill = __webpack_require__(58);

	var _ponyfill2 = _interopRequireDefault(_ponyfill);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var root; /* global window */


	if (typeof self !== 'undefined') {
	  root = self;
	} else if (typeof window !== 'undefined') {
	  root = window;
	} else if (typeof global !== 'undefined') {
	  root = global;
	} else if (true) {
	  root = module;
	} else {
	  root = Function('return this')();
	}

	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(57)(module)))

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;

		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}

		return result;
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	exports.__esModule = true;
	exports['default'] = combineReducers;

	var _createStore = __webpack_require__(44);

	var _isPlainObject = __webpack_require__(45);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _warning = __webpack_require__(60);

	var _warning2 = _interopRequireDefault(_warning);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

	  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
	}

	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }

	  if (!(0, _isPlainObject2['default'])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }

	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
	  });

	  unexpectedKeys.forEach(function (key) {
	    unexpectedKeyCache[key] = true;
	  });

	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}

	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }

	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}

	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];

	    if (process.env.NODE_ENV !== 'production') {
	      if (typeof reducers[key] === 'undefined') {
	        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
	      }
	    }

	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);

	  if (process.env.NODE_ENV !== 'production') {
	    var unexpectedKeyCache = {};
	  }

	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }

	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];

	    if (sanityError) {
	      throw sanityError;
	    }

	    if (process.env.NODE_ENV !== 'production') {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
	      if (warningMessage) {
	        (0, _warning2['default'])(warningMessage);
	      }
	    }

	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 61 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}

	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }

	  if (typeof actionCreators !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }

	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports['default'] = applyMiddleware;

	var _compose = __webpack_require__(63);

	var _compose2 = _interopRequireDefault(_compose);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }

	  return function (createStore) {
	    return function (reducer, preloadedState, enhancer) {
	      var store = createStore(reducer, preloadedState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];

	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);

	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 63 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = compose;
	/**
	 * Composes single-argument functions from right to left. The rightmost
	 * function can take multiple arguments as it provides the signature for
	 * the resulting composite function.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing the argument functions
	 * from right to left. For example, compose(f, g, h) is identical to doing
	 * (...args) => f(g(h(...args))).
	 */

	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }

	  if (funcs.length === 0) {
	    return function (arg) {
	      return arg;
	    };
	  }

	  if (funcs.length === 1) {
	    return funcs[0];
	  }

	  var last = funcs[funcs.length - 1];
	  var rest = funcs.slice(0, -1);
	  return function () {
	    return rest.reduceRight(function (composed, f) {
	      return f(composed);
	    }, last.apply(undefined, arguments));
	  };
	}

/***/ },
/* 64 */
/***/ function(module, exports) {

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */
	'use strict';

	var REACT_STATICS = {
	    childContextTypes: true,
	    contextTypes: true,
	    defaultProps: true,
	    displayName: true,
	    getDefaultProps: true,
	    mixins: true,
	    propTypes: true,
	    type: true
	};

	var KNOWN_STATICS = {
	    name: true,
	    length: true,
	    prototype: true,
	    caller: true,
	    arguments: true,
	    arity: true
	};

	var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

	module.exports = function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
	    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
	        var keys = Object.getOwnPropertyNames(sourceComponent);

	        /* istanbul ignore else */
	        if (isGetOwnPropertySymbolsAvailable) {
	            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
	        }

	        for (var i = 0; i < keys.length; ++i) {
	            if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
	                try {
	                    targetComponent[keys[i]] = sourceComponent[keys[i]];
	                } catch (error) {

	                }
	            }
	        }
	    }

	    return targetComponent;
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.buildLoadIfNeeded = buildLoadIfNeeded;

	var _actionConstants = __webpack_require__(3);

	function buildLoadIfNeeded(getFetch, actions) {
	  return function loadIfNeeded(dispatch, resourceConnect) {
	    var notInState = resourceConnect.notInState;
	    var hash = resourceConnect.hash;
	    var resource = resourceConnect.resource;

	    //If there already is an entry, it means that an action has already been
	    //dispatch for this resource and these props

	    if (!notInState) return;

	    //let's not mutate initial `resourceConnect`, just in case
	    var config = Object.assign({}, resourceConnect);
	    delete config.notInState;
	    dispatch({
	      type: actions[_actionConstants.LOAD],
	      payload: {
	        hash: hash,
	        config: config
	      }
	    });

	    var fetchResource = getFetch();

	    var success = function success(results) {
	      return dispatch({
	        type: actions[_actionConstants.LOAD_SUCCESS],
	        payload: {
	          hash: hash,
	          results: results
	        }
	      });
	    };

	    var failure = function failure(error) {
	      return dispatch({
	        type: actions[_actionConstants.LOAD_FAILURE],
	        payload: {
	          hash: hash,
	          error: error
	        }
	      });
	    };
	    return fetchResource(resource).then(success, failure);
	  };
	}

/***/ },
/* 67 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var LOADED = exports.LOADED = 'LOADED';
	var LOADING = exports.LOADING = 'LOADING';
	var FAILED = exports.FAILED = 'FAILED';

/***/ },
/* 68 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports.buildMapStateToProps = buildMapStateToProps;
	exports.buildGetEntry = buildGetEntry;
	exports.pointToStateEntry = pointToStateEntry;

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/**
	 * Returns a function that takes a resource name and a parameter description and
	 * returns an object, an array and a hash with expected values extracted from
	 * props
	 *
	 * It extracts from `props` the values expected by the resource. These values
	 * are represented as an object to serve as a payload for an action, as
	 * an array to serve as arguments for the `resourceBuilder`, and as a hash to
	 * serve as a key in the reducer.
	 * @param  {Object} props A component `props`
	 * @return {Object}       An object, an array and a hash
	 */
	function buildParamsArgsHashExtract(resourceName, paramDscrs) {
	  return function extractFromProps(props) {
	    var _paramDscrs$reduce = paramDscrs.reduce(function (_, param) {
	      if (!props.hasOwnProperty(param)) throw new Error('Expected prop `' + param + '` for `' + resourceName + '` resource was not found');
	      var val = props[param];
	      _.params[param] = val;
	      _.args.push(val);
	      return _;
	    }, { params: {}, args: [] });

	    var params = _paramDscrs$reduce.params;
	    var args = _paramDscrs$reduce.args;

	    var hash = args.join('||');
	    return {
	      params: params,
	      args: args,
	      hash: hash
	    };
	  };
	}

	/**
	 * 
	 */
	function buildMapStateToProps(resourceBuilder, config, getReducerKey) {
	  var name = config.name;
	  var params = config.params;

	  var getEntry = buildGetEntry(name, getReducerKey);
	  var extractParamsArgsHash = buildParamsArgsHashExtract(name, params);
	  return function mapStateToProps(state, props) {
	    // { params: { ... }, args: [...], hash: ' }'
	    var resourceConnect = extractParamsArgsHash(props);
	    var hash = resourceConnect.hash;

	    var entry = getEntry(state, hash);
	    if (entry) return {
	      resourceConnect: entry //{ status: ..., resourceConnect: { ...} }
	    };
	    resourceConnect.notInState = true;
	    resourceConnect.resource = resourceBuilder.apply(undefined, _toConsumableArray(resourceConnect.args));
	    return {
	      resourceConnect: resourceConnect
	    };
	  };
	}

	function buildGetEntry(name, getReducerKey) {

	  function extractState(state) {
	    var reducerKey = getReducerKey();
	    if (reducerKey === undefined) {
	      if (!state._isResourceReducer) {
	        throw new Error('An issue occured while trying to extract information ' + ('about `' + name + '`. The reducer has not been created with ') + '`react-redux-resource`. If you use an utility function like ' + '`combineReducers` to build your reducer, be sure you passed the key ' + 'where you reducer stays as first argument to ' + '`buildresourceConnector`.');
	      }
	      return state[name];
	    } else {
	      if (!state.hasOwnProperty(reducerKey)) {
	        throw new Error('An issue occured while trying to extract information ' + ('about `' + name + '`. The reducer has not been created with ') + '`react-redux-resource`. If you use an utility function like ' + '`combineReducers` to build your reducer, be sure the key you gave ' + 'to your reducer within `combineReducers` matched the key you ' + 'passed as first argument to `buildResourceConnector`' + ('(ie `' + reducerKey + '`).'));
	      }
	      return state[reducerKey][name];
	    }
	  }

	  return function getEntry(state, hash) {
	    var pieceOfState = extractState(state);
	    //First time `mapStateToProps` is called, the entry for the resource has
	    //not yet been created within ghe reducer
	    if (pieceOfState === undefined) return;
	    return pieceOfState[hash];
	  };
	}

	/**
	 * Builds a function that will apply a `handler` to a given part of the
	 * state and return a new copy of the state.
	 *
	 * The 'given part' of the state is determined by the payload.
	 *
	 * It takes a nested object (`state`) and 
	 * some information about which piece of the state to work on (`payload`)
	 * return a new object with the  in immutable way by applying
	 * a handler to some nested entry in the state.
	 *
	 * It returns a function which takes the state and a payload and will call
	 * the handler with the piece of state corresponding.
	 *
	 * The `handler` should take an object (a pice of state) and a payload, and
	 * return a new object.
	 * 
	 * @param  {[type]} hndlrsMapping [description]
	 * @return {[type]}               [description]
	 */
	function pointToStateEntry(resourceName, handler) {
	  return function (state, payload) {
	    var hash = payload.hash;
	    //No need to value `reducerKey` here.
	    //If the reducer is used with something like `combineReducers`, the state
	    //here is what stays under `reducerKey` (the combined reducer takes care of
	    //passing the action to the right piece of state), so we should assume
	    //the `resourceName` property is at the root.
	    //`reducerKey` entry

	    var resourceState = state[resourceName];
	    var pieceOfState = resourceState[hash];

	    return _extends({}, state, _defineProperty({}, resourceName, _extends({}, resourceState, _defineProperty({}, hash, handler(pieceOfState, payload)))));
	  };
	}

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports.buildReducer = buildReducer;

	var _stateUtils = __webpack_require__(68);

	var _remoteConstants = __webpack_require__(67);

	var _actionConstants = __webpack_require__(3);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function loadHndlr(stateEntry, _ref) {
	  var config = _ref.config;

	  return Object.assign({}, config, { status: _remoteConstants.LOADING });
	}

	function loadSuccesHndlr(stateEntry, _ref2) {
	  var results = _ref2.results;

	  return _extends({}, stateEntry, {
	    status: _remoteConstants.LOADED,
	    results: results
	  });
	}

	function loadFailureHndlr(stateEntry, _ref3) {
	  var error = _ref3.error;

	  return _extends({}, stateEntry, {
	    status: _remoteConstants.FAILED,
	    error: error.toString()
	  });
	}

	function buildReducer(actionNamesMapping) {
	  //safety check: we should not modify `actionNamesMapping` after the
	  //reducer has been built (if we did, our reducer would not be a pure
	  //function anymore)
	  Object.freeze(actionNamesMapping);
	  var names = [].concat(_toConsumableArray(new Set(Object.keys(actionNamesMapping).map(function (actionName) {
	    return actionNamesMapping[actionName].name;
	  }))));

	  return function reducer(state, action) {
	    //state initialization
	    if (state === undefined) {
	      return Object.assign({
	        _isResourceReducer: true,
	        _names: []
	      }, names.reduce(function (_, name) {
	        _[name] = {};
	        return _;
	      }, {}));
	    }
	    //type is the action name
	    var payload = action.payload;
	    var type = action.type;
	    //we're not interested in this action

	    if (!actionNamesMapping.hasOwnProperty(type)) return state;
	    var _actionNamesMapping$t = actionNamesMapping[type];
	    var loadAction = _actionNamesMapping$t.loadAction;
	    var name = _actionNamesMapping$t.name;

	    switch (loadAction) {
	      case _actionConstants.LOAD:
	        return (0, _stateUtils.pointToStateEntry)(name, loadHndlr)(state, payload);
	      case _actionConstants.LOAD_SUCCESS:
	        return (0, _stateUtils.pointToStateEntry)(name, loadSuccesHndlr)(state, payload);
	      case _actionConstants.LOAD_FAILURE:
	        return (0, _stateUtils.pointToStateEntry)(name, loadFailureHndlr)(state, payload);
	      case _actionConstants.FLUSH:
	        //reset all resource results
	        return Object.keys(actionNamesMapping).reduce(function (_, actionName) {
	          _[actionName] = {};
	          return _;
	        }, {});
	      default:
	        return state;
	    }
	  };
	}

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.resourceCombine = resourceCombine;

	var _connect = __webpack_require__(4);

	var _remoteConstants = __webpack_require__(67);

	function resourceCombine() {
	  for (var _len = arguments.length, crs = Array(_len), _key = 0; _key < _len; _key++) {
	    crs[_key] = arguments[_key];
	  }

	  var loadIfNeededCombined = function loadIfNeededCombined(dispatch, resourceConnect) {
	    crs.map(function (_ref, i) {
	      var loadIfNeeded = _ref.loadIfNeeded;
	      return loadIfNeeded(dispatch, resourceConnect.connectors[i]);
	    });
	  };
	  var mSTPCombined = function mSTPCombined(state, props) {
	    var statusCombined = void 0;
	    var resourceConnectCrs = crs.map(function (_ref2) {
	      var mapStateToProps = _ref2.mapStateToProps;

	      var _mapStateToProps = mapStateToProps(state, props);

	      var resourceConnect = _mapStateToProps.resourceConnect;
	      var status = resourceConnect.status;
	      //if one connector has failed, we mark the combination as failed

	      if (status === _remoteConstants.FAILED) statusCombined = _remoteConstants.FAILED;else if (statusCombined !== _remoteConstants.FAILED) {
	        //if none has failed, LOADING take predecedence on LOADED or undefined
	        if (status === _remoteConstants.LOADING) statusCombined = _remoteConstants.LOADING;else if (status === _remoteConstants.LOADED && (statusCombined === _remoteConstants.LOADED || statusCombined === undefined)) {
	          statusCombined = _remoteConstants.LOADED;
	        }
	      }
	      return resourceConnect;
	    });
	    return {
	      resourceConnect: {
	        status: statusCombined,
	        connectors: resourceConnectCrs
	      }
	    };
	  };
	  var exposeResultsCombined = function exposeResultsCombined(resourceConnect) {
	    return Object.assign.apply(null, resourceConnect.connectors.map(function (c, i) {
	      return crs[i].exposeResults(c);
	    }));
	  };
	  // `resourceName` is only used here to give a display name to the component
	  //TODO crs[0].resourceName seems to be undefined
	  var name = crs[0].name + 'And' + (crs.length - 1) + 'More';
	  //resource, config, actions, getFetch, getReducerKey
	  return (0, _connect.buildResourceConnect)(name, loadIfNeededCombined, exposeResultsCombined, mSTPCombined);
	}

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setQueryURL = exports.setPrefixes = undefined;
	exports.checkAuthentication = checkAuthentication;
	exports.buildFetchQuery = buildFetchQuery;
	exports.buildFetchQuerySmart = buildFetchQuerySmart;

	var _isomorphicFetch = __webpack_require__(72);

	var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

	var _results = __webpack_require__(74);

	var _index = __webpack_require__(75);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var bodyFromSparql = function bodyFromSparql(query) {
	  return 'query=' + encodeURIComponent(query);
	};

	//object with all known prefixes
	//Stardog HTTP API documentation: http://docs.stardog.apiary.io/#
	var prefixes = {
	  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#'
	};
	var setPrefixes = exports.setPrefixes = function setPrefixes(prefixDict) {
	  return prefixes = prefixDict;
	};

	//sparql endpoint URL
	var queryURL = void 0;
	var setQueryURL = exports.setQueryURL = function setQueryURL(URL) {
	  return queryURL = URL;
	};

	function checkAuthentication(token) {
	  //This query is used to check if the server returns an authentication error
	  var testQuery = 'SELECT ?s { ?s ?p ?o} LIMIT 1';
	  var fetchQuery = buildFetchQuery(token);
	  return fetchQuery(testQuery)
	  //might need more fine grained control
	  .then(function (res) {
	    return res.ok;
	  });
	}

	function buildFetchQuery(token) {
	  if (queryURL === undefined) throw new Error('Attempting to send a query but the sparql endpoint URL has not been ' + 'set. Use `setQueryURL` to define this URL.');
	  //`fetchQuery` is a function that takes a `sparql` query string, sends it to
	  //the server and returns a promise that resolves to the query results
	  // (https://www.w3.org/TR/sparql11-results-json/)
	  return function fetchQuery(query) {
	    return (0, _isomorphicFetch2.default)(queryURL, {
	      method: 'POST',
	      headers: {
	        'Authorization': token,
	        'Accept': 'application/sparql-results+json',
	        // We need to pass some `x-www-form-urlencoded` data. 
	        //`multipart/form-data` created with `new FormData()` does not work.
	        'Content-Type': 'application/x-www-form-urlencoded'
	      },
	      body: bodyFromSparql((0, _index.processQuery)(query, prefixes))
	    });
	  };
	}

	function buildFetchQuerySmart(token) {
	  return function fetchQuerySmart(_ref) {
	    var query = _ref.query,
	        singleResult = _ref.singleResult;

	    return buildFetchQuery(token)(query).then(function (res) {
	      return res.json();
	    }).then((0, _results.buildProcessResults)(singleResult));
	  };
	}

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// the whatwg-fetch polyfill installs the fetch() function
	// on the global object (window or self)
	//
	// Return that as the export for use in Webpack, Browserify etc.
	__webpack_require__(73);
	module.exports = self.fetch.bind(self);


/***/ },
/* 73 */
/***/ function(module, exports) {

	(function(self) {
	  'use strict';

	  if (self.fetch) {
	    return
	  }

	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob()
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }

	  if (support.arrayBuffer) {
	    var viewClasses = [
	      '[object Int8Array]',
	      '[object Uint8Array]',
	      '[object Uint8ClampedArray]',
	      '[object Int16Array]',
	      '[object Uint16Array]',
	      '[object Int32Array]',
	      '[object Uint32Array]',
	      '[object Float32Array]',
	      '[object Float64Array]'
	    ]

	    var isDataView = function(obj) {
	      return obj && DataView.prototype.isPrototypeOf(obj)
	    }

	    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
	      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
	    }
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }

	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift()
	        return {done: value === undefined, value: value}
	      }
	    }

	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      }
	    }

	    return iterator
	  }

	  function Headers(headers) {
	    this.map = {}

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)

	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var oldValue = this.map[name]
	    this.map[name] = oldValue ? oldValue+','+value : value
	  }

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }

	  Headers.prototype.get = function(name) {
	    name = normalizeName(name)
	    return this.has(name) ? this.map[name] : null
	  }

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = normalizeValue(value)
	  }

	  Headers.prototype.forEach = function(callback, thisArg) {
	    for (var name in this.map) {
	      if (this.map.hasOwnProperty(name)) {
	        callback.call(thisArg, this.map[name], name, this)
	      }
	    }
	  }

	  Headers.prototype.keys = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push(name) })
	    return iteratorFor(items)
	  }

	  Headers.prototype.values = function() {
	    var items = []
	    this.forEach(function(value) { items.push(value) })
	    return iteratorFor(items)
	  }

	  Headers.prototype.entries = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push([name, value]) })
	    return iteratorFor(items)
	  }

	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    var promise = fileReaderReady(reader)
	    reader.readAsArrayBuffer(blob)
	    return promise
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    var promise = fileReaderReady(reader)
	    reader.readAsText(blob)
	    return promise
	  }

	  function readArrayBufferAsText(buf) {
	    var view = new Uint8Array(buf)
	    var chars = new Array(view.length)

	    for (var i = 0; i < view.length; i++) {
	      chars[i] = String.fromCharCode(view[i])
	    }
	    return chars.join('')
	  }

	  function bufferClone(buf) {
	    if (buf.slice) {
	      return buf.slice(0)
	    } else {
	      var view = new Uint8Array(buf.byteLength)
	      view.set(new Uint8Array(buf))
	      return view.buffer
	    }
	  }

	  function Body() {
	    this.bodyUsed = false

	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (!body) {
	        this._bodyText = ''
	      } else if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString()
	      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	        this._bodyArrayBuffer = bufferClone(body.buffer)
	        // IE 10-11 can't handle a DataView body.
	        this._bodyInit = new Blob([this._bodyArrayBuffer])
	      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	        this._bodyArrayBuffer = bufferClone(body)
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
	        }
	      }
	    }

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyArrayBuffer) {
	          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }

	      this.arrayBuffer = function() {
	        if (this._bodyArrayBuffer) {
	          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
	        } else {
	          return this.blob().then(readBlobAsArrayBuffer)
	        }
	      }
	    }

	    this.text = function() {
	      var rejected = consumed(this)
	      if (rejected) {
	        return rejected
	      }

	      if (this._bodyBlob) {
	        return readBlobAsText(this._bodyBlob)
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as text')
	      } else {
	        return Promise.resolve(this._bodyText)
	      }
	    }

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {}
	    var body = options.body

	    if (typeof input === 'string') {
	      this.url = input
	    } else {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body && input._bodyInit != null) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    }

	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }

	  Request.prototype.clone = function() {
	    return new Request(this, { body: this._bodyInit })
	  }

	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }

	  function parseHeaders(rawHeaders) {
	    var headers = new Headers()
	    rawHeaders.split('\r\n').forEach(function(line) {
	      var parts = line.split(':')
	      var key = parts.shift().trim()
	      if (key) {
	        var value = parts.join(':').trim()
	        headers.append(key, value)
	      }
	    })
	    return headers
	  }

	  Body.call(Request.prototype)

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }

	    this.type = 'default'
	    this.status = 'status' in options ? options.status : 200
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = 'statusText' in options ? options.statusText : 'OK'
	    this.headers = new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }

	  Body.call(Response.prototype)

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }

	  var redirectStatuses = [301, 302, 303, 307, 308]

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  }

	  self.Headers = Headers
	  self.Request = Request
	  self.Response = Response

	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request = new Request(input, init)
	      var xhr = new XMLHttpRequest()

	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	        }
	        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
	        var body = 'response' in xhr ? xhr.response : xhr.responseText
	        resolve(new Response(body, options))
	      }

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }

	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'))
	      }

	      xhr.open(request.method, request.url, true)

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);


/***/ },
/* 74 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.buildProcessResults = buildProcessResults;
	function buildProcessLine(vars) {
	  return function processLine(line) {
	    return vars.reduce(function (rslts, rsltDescr) {
	      var field = line[rsltDescr];
	      //some optional variables might not be present in the line
	      rslts[rsltDescr] = field !== undefined ? field.value : '';
	      return rslts;
	    }, {});
	  };
	}

	function buildProcessFn() {
	  return function (rawResults) {
	    //We will rely on `heads.var` returned by the server to process results
	    var vars = rawResults.head.vars;
	    return rawResults.results.bindings.map(buildProcessLine(vars));
	  };
	}

	function singleResultAjustments(results) {
	  if (results.length === 1) return results[0];
	  //If there is no result when a single result is expected, we throw an error.
	  //The common use case for single results is when we try to show details for 
	  //a selected object.
	  if (results.length === 0) throw new Error('One result was expected but no result was found');
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
	function buildProcessResults(singleResult) {
	  var processFn = buildProcessFn();
	  return singleResult ?
	  //special adjustments for `singleResult` requests
	  function (rawResults) {
	    return singleResultAjustments(processFn(rawResults));
	  } : processFn;
	}

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.parse = parse;
	exports.processQuery = processQuery;

	var _sparqlParser = __webpack_require__(76);

	var buildPrefix = function buildPrefix(name, uri) {
	  return 'PREFIX ' + name + ': <' + uri + '>';
	};

	var parser = new _sparqlParser.Parser();

	/**
	 * Parse a query and check its syntax, including missing prefixes
	 *
	 * It throws an error if it's not a valid sparql query. It returns an object
	 * representing the query if the syntax is ok.
	 *
	 * Possible missing prefixes will be listed in `missingPrefixes` array
	 *
	 * @param  {string} query sparql query
	 * @return {object}       javascript representation of the query
	 */
	function parse(query) {
	  //reset Parser properties
	  //we want all prefixes to be explicit in the request sent to the server.
	  _sparqlParser.Parser.prefixes = {};
	  _sparqlParser.Parser.missingPrefixes = [];
	  return parser.parse(query);
	}

	/**
	 * Parse a sparql query and try to fix missing prefixes
	 *
	 * If the query is valid, it returns the initial query.
	 * If the syntax is correct but some prefixes are missing, it will try to fix
	 * missing prefixes by looking up in `knownPrefixes`
	 * If there's an issue with the syntax or if it was not able to fix missing
	 * prefixes, it will throw an error.
	 * 
	 * @param  {string} query         sparql query
	 * @param  {object} knownPrefixes an object with prefix as key and corresponding
	 *                                url as value
	 * @return {string}               sparql query
	 */
	function parseQuery(query, knownPrefixes) {
	  //for missing prefixes that have been defined locally, we will add then
	  //to the query
	  var _parse = parse(query),
	      missingPrefixes = _parse.missingPrefixes;

	  if (missingPrefixes.length === 0) return query;
	  var found = [],
	      notFound = [];
	  missingPrefixes.forEach(function (p) {
	    knownPrefixes.hasOwnProperty(p) ? found.push([p, knownPrefixes[p]]) : notFound.push(p);
	  });
	  if (notFound.length > 0) throw new Error('Some prefixes (' + notFound.join(',') + ') are missing in \n`' + query + '`');
	  //we add missing prefixes which are found in `prefixes.js`
	  var buildQuery = found.map(function (_ref) {
	    var _ref2 = _slicedToArray(_ref, 2),
	        name = _ref2[0],
	        uri = _ref2[1];

	    return buildPrefix(name, uri);
	  });
	  buildQuery.push(query);
	  return buildQuery.join('\n');
	}

	function processQuery(query, prefixes) {
	  //Safety check: if we don't set the query params properly, or if the
	  //connected component does not receive the expected props, we might find
	  //`undefined` somewhere in the query.
	  if (query.includes('undefined')) console.warn('One query refers to `undefied`, there might be an issue ' + 'with query parameters configuration or with the component props. ' + ('Query: \n' + query));
	  //we check the query syntax and add missing prefix that have been defined
	  //locally
	  var parsedQuery = void 0;
	  try {
	    parsedQuery = parseQuery(query, prefixes);
	  } catch (err) {
	    throw new Error('Invalid query ' + err + ' in ' + query);
	  }
	  return parsedQuery;
	}

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, module) {"use strict";

	/* parser generated by jison 0.4.16 */
	/*
	  Returns a Parser object of the following structure:

	  Parser: {
	    yy: {}
	  }

	  Parser.prototype: {
	    yy: {},
	    trace: function(),
	    symbols_: {associative list: name ==> number},
	    terminals_: {associative list: number ==> name},
	    productions_: [...],
	    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
	    table: [...],
	    defaultActions: {...},
	    parseError: function(str, hash),
	    parse: function(input),

	    lexer: {
	        EOF: 1,
	        parseError: function(str, hash),
	        setInput: function(input),
	        input: function(),
	        unput: function(str),
	        more: function(),
	        less: function(n),
	        pastInput: function(),
	        upcomingInput: function(),
	        showPosition: function(),
	        test_match: function(regex_match_array, rule_index),
	        next: function(),
	        lex: function(),
	        begin: function(condition),
	        popState: function(),
	        _currentRules: function(),
	        topState: function(),
	        pushState: function(condition),

	        options: {
	            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
	            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
	            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
	        },

	        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
	        rules: [...],
	        conditions: {associative list: name ==> set},
	    }
	  }


	  token location info (@$, _$, etc.): {
	    first_line: n,
	    last_line: n,
	    first_column: n,
	    last_column: n,
	    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
	  }


	  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
	    text:        (matched text)
	    token:       (the produced terminal token, if any)
	    line:        (yylineno)
	  }
	  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
	    loc:         (yylloc)
	    expected:    (string describing the set of expected tokens)
	    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
	  }
	*/
	var sparqlParser = function () {
	    var o = function o(k, v, _o, l) {
	        for (_o = _o || {}, l = k.length; l--; _o[k[l]] = v) {}return _o;
	    },
	        $V0 = [11, 14, 23, 33, 42, 47, 95, 105, 108, 110, 111, 120, 121, 126, 292, 293, 294, 295, 296],
	        $V1 = [95, 105, 108, 110, 111, 120, 121, 126, 292, 293, 294, 295, 296],
	        $V2 = [1, 21],
	        $V3 = [1, 25],
	        $V4 = [6, 82],
	        $V5 = [37, 38, 50],
	        $V6 = [37, 50],
	        $V7 = [1, 55],
	        $V8 = [1, 57],
	        $V9 = [1, 53],
	        $Va = [1, 56],
	        $Vb = [27, 28, 287],
	        $Vc = [12, 15, 281],
	        $Vd = [107, 129, 290, 297],
	        $Ve = [12, 15, 107, 129, 281],
	        $Vf = [1, 76],
	        $Vg = [1, 80],
	        $Vh = [1, 82],
	        $Vi = [107, 129, 290, 291, 297],
	        $Vj = [12, 15, 107, 129, 281, 291],
	        $Vk = [1, 89],
	        $Vl = [2, 231],
	        $Vm = [1, 88],
	        $Vn = [12, 15, 27, 28, 79, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281],
	        $Vo = [6, 37, 38, 50, 60, 67, 70, 78, 80, 82],
	        $Vp = [6, 12, 15, 27, 37, 38, 50, 60, 67, 70, 78, 80, 82, 281],
	        $Vq = [6, 12, 15, 27, 28, 30, 31, 37, 38, 40, 50, 60, 67, 70, 78, 79, 80, 82, 89, 104, 107, 120, 121, 123, 128, 155, 156, 158, 161, 162, 163, 181, 192, 203, 208, 210, 211, 213, 214, 218, 222, 226, 241, 246, 263, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 298, 301, 302, 304, 305, 306, 307, 308, 309, 310, 311],
	        $Vr = [1, 104],
	        $Vs = [1, 105],
	        $Vt = [6, 12, 15, 27, 28, 38, 40, 79, 82, 107, 155, 156, 158, 161, 162, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 298],
	        $Vu = [27, 31],
	        $Vv = [2, 286],
	        $Vw = [1, 118],
	        $Vx = [1, 116],
	        $Vy = [6, 192],
	        $Vz = [2, 303],
	        $VA = [2, 291],
	        $VB = [37, 123],
	        $VC = [6, 40, 67, 70, 78, 80, 82],
	        $VD = [2, 233],
	        $VE = [1, 132],
	        $VF = [1, 134],
	        $VG = [1, 144],
	        $VH = [1, 150],
	        $VI = [1, 153],
	        $VJ = [1, 149],
	        $VK = [1, 151],
	        $VL = [1, 147],
	        $VM = [1, 148],
	        $VN = [1, 154],
	        $VO = [1, 155],
	        $VP = [1, 158],
	        $VQ = [1, 159],
	        $VR = [1, 160],
	        $VS = [1, 161],
	        $VT = [1, 162],
	        $VU = [1, 163],
	        $VV = [1, 164],
	        $VW = [1, 165],
	        $VX = [1, 166],
	        $VY = [1, 167],
	        $VZ = [1, 168],
	        $V_ = [1, 169],
	        $V$ = [6, 60, 67, 70, 78, 80, 82],
	        $V01 = [27, 28, 37, 38, 50],
	        $V11 = [12, 15, 27, 28, 79, 243, 244, 245, 247, 249, 250, 252, 253, 256, 258, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 311, 312, 313, 314, 315, 316],
	        $V21 = [2, 400],
	        $V31 = [1, 182],
	        $V41 = [1, 183],
	        $V51 = [1, 184],
	        $V61 = [12, 15, 40, 79, 89, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281],
	        $V71 = [6, 104, 192],
	        $V81 = [40, 107],
	        $V91 = [6, 40, 70, 78, 80, 82],
	        $Va1 = [2, 315],
	        $Vb1 = [2, 307],
	        $Vc1 = [12, 15, 27, 181, 281],
	        $Vd1 = [2, 343],
	        $Ve1 = [2, 339],
	        $Vf1 = [12, 15, 27, 28, 31, 38, 40, 79, 82, 107, 155, 156, 158, 161, 162, 163, 181, 192, 203, 208, 210, 211, 213, 214, 246, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 298],
	        $Vg1 = [12, 15, 27, 28, 30, 31, 38, 40, 79, 82, 89, 107, 155, 156, 158, 161, 162, 163, 181, 192, 203, 208, 210, 211, 213, 214, 218, 222, 226, 241, 246, 263, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 298, 302, 305, 306, 307, 308, 309, 310, 311],
	        $Vh1 = [12, 15, 27, 28, 30, 31, 38, 40, 79, 82, 89, 107, 155, 156, 158, 161, 162, 163, 181, 192, 203, 208, 210, 211, 213, 214, 218, 222, 226, 241, 246, 263, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 298, 302, 305, 306, 307, 308, 309, 310, 311],
	        $Vi1 = [30, 31, 192, 218, 246],
	        $Vj1 = [30, 31, 192, 218, 222, 246],
	        $Vk1 = [30, 31, 192, 218, 222, 226, 241, 246, 263, 275, 276, 277, 278, 279, 280, 305, 306, 307, 308, 309, 310, 311],
	        $Vl1 = [30, 31, 192, 218, 222, 226, 241, 246, 263, 275, 276, 277, 278, 279, 280, 287, 302, 305, 306, 307, 308, 309, 310, 311],
	        $Vm1 = [1, 248],
	        $Vn1 = [1, 249],
	        $Vo1 = [1, 251],
	        $Vp1 = [1, 252],
	        $Vq1 = [1, 253],
	        $Vr1 = [1, 254],
	        $Vs1 = [1, 256],
	        $Vt1 = [1, 257],
	        $Vu1 = [2, 407],
	        $Vv1 = [1, 259],
	        $Vw1 = [1, 260],
	        $Vx1 = [1, 261],
	        $Vy1 = [1, 267],
	        $Vz1 = [1, 262],
	        $VA1 = [1, 263],
	        $VB1 = [1, 264],
	        $VC1 = [1, 265],
	        $VD1 = [1, 266],
	        $VE1 = [1, 274],
	        $VF1 = [1, 285],
	        $VG1 = [6, 40, 78, 80, 82],
	        $VH1 = [1, 302],
	        $VI1 = [1, 301],
	        $VJ1 = [38, 40, 82, 107, 155, 156, 158, 161, 162],
	        $VK1 = [1, 310],
	        $VL1 = [1, 311],
	        $VM1 = [40, 107, 298],
	        $VN1 = [12, 15, 27, 28, 31, 79, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281],
	        $VO1 = [12, 15, 27, 28, 31, 38, 40, 79, 82, 107, 155, 156, 158, 161, 162, 163, 192, 210, 211, 213, 214, 246, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 298],
	        $VP1 = [12, 15, 27, 28, 79, 203, 241, 243, 244, 245, 247, 249, 250, 252, 253, 256, 258, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 305, 311, 312, 313, 314, 315, 316],
	        $VQ1 = [1, 337],
	        $VR1 = [1, 338],
	        $VS1 = [1, 340],
	        $VT1 = [1, 339],
	        $VU1 = [6, 12, 15, 27, 28, 30, 31, 38, 40, 67, 70, 73, 75, 78, 79, 80, 82, 107, 155, 156, 158, 161, 162, 163, 192, 210, 213, 214, 218, 222, 226, 241, 243, 244, 245, 246, 247, 249, 250, 252, 253, 256, 258, 263, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 298, 302, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316],
	        $VV1 = [1, 348],
	        $VW1 = [1, 347],
	        $VX1 = [28, 163],
	        $VY1 = [12, 15, 31, 40, 79, 89, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281],
	        $VZ1 = [28, 40],
	        $V_1 = [2, 306],
	        $V$1 = [6, 40, 82],
	        $V02 = [6, 12, 15, 28, 40, 70, 78, 80, 82, 243, 244, 245, 247, 249, 250, 252, 253, 256, 258, 281, 311, 312, 313, 314, 315, 316],
	        $V12 = [6, 12, 15, 27, 28, 38, 40, 70, 73, 75, 78, 79, 80, 82, 107, 155, 156, 158, 161, 162, 163, 210, 213, 214, 243, 244, 245, 247, 249, 250, 252, 253, 256, 258, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 298, 311, 312, 313, 314, 315, 316],
	        $V22 = [6, 12, 15, 27, 28, 40, 67, 70, 78, 80, 82, 243, 244, 245, 247, 249, 250, 252, 253, 256, 258, 281, 311, 312, 313, 314, 315, 316],
	        $V32 = [6, 12, 15, 27, 28, 30, 31, 38, 40, 60, 67, 70, 73, 75, 78, 79, 80, 82, 107, 155, 156, 158, 161, 162, 163, 192, 210, 213, 214, 218, 222, 226, 241, 243, 244, 245, 246, 247, 249, 250, 252, 253, 256, 258, 263, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 298, 299, 302, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316],
	        $V42 = [12, 15, 28, 181, 203, 208, 281],
	        $V52 = [2, 357],
	        $V62 = [1, 389],
	        $V72 = [38, 40, 82, 107, 155, 156, 158, 161, 162, 298],
	        $V82 = [2, 345],
	        $V92 = [12, 15, 27, 28, 31, 38, 40, 79, 82, 107, 155, 156, 158, 161, 162, 163, 181, 192, 210, 211, 213, 214, 246, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 298],
	        $Va2 = [12, 15, 27, 28, 79, 203, 241, 243, 244, 245, 247, 249, 250, 252, 253, 256, 258, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 305, 311, 312, 313, 314, 315, 316],
	        $Vb2 = [1, 439],
	        $Vc2 = [1, 436],
	        $Vd2 = [1, 437],
	        $Ve2 = [12, 15, 27, 28, 38, 40, 79, 82, 107, 155, 156, 158, 161, 162, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281],
	        $Vf2 = [12, 15, 27, 281],
	        $Vg2 = [12, 15, 27, 28, 38, 40, 79, 82, 107, 155, 156, 158, 161, 162, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 298],
	        $Vh2 = [2, 318],
	        $Vi2 = [12, 15, 27, 181, 192, 281],
	        $Vj2 = [12, 15, 31, 79, 89, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281],
	        $Vk2 = [6, 12, 15, 27, 28, 40, 73, 75, 78, 80, 82, 243, 244, 245, 247, 249, 250, 252, 253, 256, 258, 281, 311, 312, 313, 314, 315, 316],
	        $Vl2 = [2, 313],
	        $Vm2 = [12, 15, 28, 181, 203, 281],
	        $Vn2 = [38, 40, 82, 107, 155, 156, 158, 161, 162, 192, 211, 298],
	        $Vo2 = [12, 15, 27, 28, 40, 79, 107, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281],
	        $Vp2 = [12, 15, 27, 28, 31, 79, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 301, 302],
	        $Vq2 = [12, 15, 27, 28, 31, 79, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 301, 302, 304, 305],
	        $Vr2 = [1, 549],
	        $Vs2 = [1, 550],
	        $Vt2 = [2, 301],
	        $Vu2 = [12, 15, 31, 181, 208, 281];
	    var parser = { trace: function trace() {},
	        yy: {},
	        symbols_: { "error": 2, "QueryOrUpdateUnit": 3, "QueryOrUpdateUnit_repetition0": 4, "QueryOrUpdateUnit_group0": 5, "EOF": 6, "Query": 7, "Query_group0": 8, "Query_option0": 9, "BaseDecl": 10, "BASE": 11, "IRIREF": 12, "PrefixDecl": 13, "PREFIX": 14, "PNAME_NS": 15, "SelectQuery": 16, "SelectClause": 17, "SelectQuery_repetition0": 18, "WhereClause": 19, "SolutionModifier": 20, "SubSelect": 21, "SubSelect_option0": 22, "SELECT": 23, "SelectClause_option0": 24, "SelectClause_group0": 25, "SelectClauseItem": 26, "VAR": 27, "(": 28, "Expression": 29, "AS": 30, ")": 31, "ConstructQuery": 32, "CONSTRUCT": 33, "ConstructTemplate": 34, "ConstructQuery_repetition0": 35, "ConstructQuery_repetition1": 36, "WHERE": 37, "{": 38, "ConstructQuery_option0": 39, "}": 40, "DescribeQuery": 41, "DESCRIBE": 42, "DescribeQuery_group0": 43, "DescribeQuery_repetition0": 44, "DescribeQuery_option0": 45, "AskQuery": 46, "ASK": 47, "AskQuery_repetition0": 48, "DatasetClause": 49, "FROM": 50, "DatasetClause_option0": 51, "iri": 52, "WhereClause_option0": 53, "GroupGraphPattern": 54, "SolutionModifier_option0": 55, "SolutionModifier_option1": 56, "SolutionModifier_option2": 57, "SolutionModifier_option3": 58, "GroupClause": 59, "GROUP": 60, "BY": 61, "GroupClause_repetition_plus0": 62, "GroupCondition": 63, "BuiltInCall": 64, "FunctionCall": 65, "HavingClause": 66, "HAVING": 67, "HavingClause_repetition_plus0": 68, "OrderClause": 69, "ORDER": 70, "OrderClause_repetition_plus0": 71, "OrderCondition": 72, "ASC": 73, "BrackettedExpression": 74, "DESC": 75, "Constraint": 76, "LimitOffsetClauses": 77, "LIMIT": 78, "INTEGER": 79, "OFFSET": 80, "ValuesClause": 81, "VALUES": 82, "InlineData": 83, "InlineData_repetition0": 84, "InlineData_repetition1": 85, "InlineData_repetition2": 86, "DataBlockValue": 87, "Literal": 88, "UNDEF": 89, "DataBlockValueList": 90, "DataBlockValueList_repetition0": 91, "Update": 92, "Update_repetition0": 93, "Update1": 94, "LOAD": 95, "Update1_option0": 96, "Update1_option1": 97, "Update1_group0": 98, "Update1_option2": 99, "GraphRefAll": 100, "Update1_group1": 101, "Update1_option3": 102, "GraphOrDefault": 103, "TO": 104, "CREATE": 105, "Update1_option4": 106, "GRAPH": 107, "INSERTDATA": 108, "QuadPattern": 109, "DELETEDATA": 110, "DELETEWHERE": 111, "Update1_option5": 112, "InsertClause": 113, "Update1_option6": 114, "Update1_repetition0": 115, "Update1_option7": 116, "DeleteClause": 117, "Update1_option8": 118, "Update1_repetition1": 119, "DELETE": 120, "INSERT": 121, "UsingClause": 122, "USING": 123, "UsingClause_option0": 124, "WithClause": 125, "WITH": 126, "IntoGraphClause": 127, "INTO": 128, "DEFAULT": 129, "GraphOrDefault_option0": 130, "GraphRefAll_group0": 131, "QuadPattern_option0": 132, "QuadPattern_repetition0": 133, "QuadsNotTriples": 134, "QuadsNotTriples_group0": 135, "QuadsNotTriples_option0": 136, "QuadsNotTriples_option1": 137, "QuadsNotTriples_option2": 138, "TriplesTemplate": 139, "TriplesTemplate_repetition0": 140, "TriplesSameSubject": 141, "TriplesTemplate_option0": 142, "GroupGraphPatternSub": 143, "GroupGraphPatternSub_option0": 144, "GroupGraphPatternSub_repetition0": 145, "GroupGraphPatternSubTail": 146, "GraphPatternNotTriples": 147, "GroupGraphPatternSubTail_option0": 148, "GroupGraphPatternSubTail_option1": 149, "TriplesBlock": 150, "TriplesBlock_repetition0": 151, "TriplesSameSubjectPath": 152, "TriplesBlock_option0": 153, "GraphPatternNotTriples_repetition0": 154, "OPTIONAL": 155, "MINUS": 156, "GraphPatternNotTriples_group0": 157, "SERVICE": 158, "GraphPatternNotTriples_option0": 159, "GraphPatternNotTriples_group1": 160, "FILTER": 161, "BIND": 162, "NIL": 163, "FunctionCall_option0": 164, "FunctionCall_repetition0": 165, "ExpressionList": 166, "ExpressionList_repetition0": 167, "ConstructTemplate_option0": 168, "ConstructTriples": 169, "ConstructTriples_repetition0": 170, "ConstructTriples_option0": 171, "VarOrTerm": 172, "PropertyListNotEmpty": 173, "TriplesNode": 174, "PropertyList": 175, "PropertyList_option0": 176, "PropertyListNotEmpty_repetition0": 177, "VerbObjectList": 178, "Verb": 179, "ObjectList": 180, "a": 181, "ObjectList_repetition0": 182, "GraphNode": 183, "PropertyListPathNotEmpty": 184, "TriplesNodePath": 185, "TriplesSameSubjectPath_option0": 186, "PropertyListPathNotEmpty_group0": 187, "PropertyListPathNotEmpty_repetition0": 188, "GraphNodePath": 189, "PropertyListPathNotEmpty_repetition1": 190, "PropertyListPathNotEmptyTail": 191, ";": 192, "PropertyListPathNotEmptyTail_group0": 193, "Path": 194, "Path_repetition0": 195, "PathSequence": 196, "PathSequence_repetition0": 197, "PathEltOrInverse": 198, "PathElt": 199, "PathPrimary": 200, "PathElt_option0": 201, "PathEltOrInverse_option0": 202, "!": 203, "PathNegatedPropertySet": 204, "PathOneInPropertySet": 205, "PathNegatedPropertySet_repetition0": 206, "PathNegatedPropertySet_option0": 207, "^": 208, "TriplesNode_repetition_plus0": 209, "[": 210, "]": 211, "TriplesNodePath_repetition_plus0": 212, "BLANK_NODE_LABEL": 213, "ANON": 214, "ConditionalAndExpression": 215, "Expression_repetition0": 216, "ExpressionTail": 217, "||": 218, "RelationalExpression": 219, "ConditionalAndExpression_repetition0": 220, "ConditionalAndExpressionTail": 221, "&&": 222, "AdditiveExpression": 223, "RelationalExpression_group0": 224, "RelationalExpression_option0": 225, "IN": 226, "MultiplicativeExpression": 227, "AdditiveExpression_repetition0": 228, "AdditiveExpressionTail": 229, "AdditiveExpressionTail_group0": 230, "NumericLiteralPositive": 231, "AdditiveExpressionTail_repetition0": 232, "NumericLiteralNegative": 233, "AdditiveExpressionTail_repetition1": 234, "UnaryExpression": 235, "MultiplicativeExpression_repetition0": 236, "MultiplicativeExpressionTail": 237, "MultiplicativeExpressionTail_group0": 238, "UnaryExpression_option0": 239, "PrimaryExpression": 240, "-": 241, "Aggregate": 242, "FUNC_ARITY0": 243, "FUNC_ARITY1": 244, "FUNC_ARITY2": 245, ",": 246, "IF": 247, "BuiltInCall_group0": 248, "BOUND": 249, "BNODE": 250, "BuiltInCall_option0": 251, "EXISTS": 252, "COUNT": 253, "Aggregate_option0": 254, "Aggregate_group0": 255, "FUNC_AGGREGATE": 256, "Aggregate_option1": 257, "GROUP_CONCAT": 258, "Aggregate_option2": 259, "Aggregate_option3": 260, "GroupConcatSeparator": 261, "SEPARATOR": 262, "=": 263, "String": 264, "LANGTAG": 265, "^^": 266, "DECIMAL": 267, "DOUBLE": 268, "true": 269, "false": 270, "STRING_LITERAL1": 271, "STRING_LITERAL2": 272, "STRING_LITERAL_LONG1": 273, "STRING_LITERAL_LONG2": 274, "INTEGER_POSITIVE": 275, "DECIMAL_POSITIVE": 276, "DOUBLE_POSITIVE": 277, "INTEGER_NEGATIVE": 278, "DECIMAL_NEGATIVE": 279, "DOUBLE_NEGATIVE": 280, "PNAME_LN": 281, "QueryOrUpdateUnit_repetition0_group0": 282, "SelectClause_option0_group0": 283, "DISTINCT": 284, "REDUCED": 285, "SelectClause_group0_repetition_plus0": 286, "*": 287, "DescribeQuery_group0_repetition_plus0_group0": 288, "DescribeQuery_group0_repetition_plus0": 289, "NAMED": 290, "SILENT": 291, "CLEAR": 292, "DROP": 293, "ADD": 294, "MOVE": 295, "COPY": 296, "ALL": 297, ".": 298, "UNION": 299, "PropertyListNotEmpty_repetition0_repetition_plus0": 300, "|": 301, "/": 302, "PathElt_option0_group0": 303, "?": 304, "+": 305, "!=": 306, "<": 307, ">": 308, "<=": 309, ">=": 310, "NOT": 311, "CONCAT": 312, "COALESCE": 313, "SUBSTR": 314, "REGEX": 315, "REPLACE": 316, "$accept": 0, "$end": 1 },
	        terminals_: { 2: "error", 6: "EOF", 11: "BASE", 12: "IRIREF", 14: "PREFIX", 15: "PNAME_NS", 23: "SELECT", 27: "VAR", 28: "(", 30: "AS", 31: ")", 33: "CONSTRUCT", 37: "WHERE", 38: "{", 40: "}", 42: "DESCRIBE", 47: "ASK", 50: "FROM", 60: "GROUP", 61: "BY", 67: "HAVING", 70: "ORDER", 73: "ASC", 75: "DESC", 78: "LIMIT", 79: "INTEGER", 80: "OFFSET", 82: "VALUES", 89: "UNDEF", 95: "LOAD", 104: "TO", 105: "CREATE", 107: "GRAPH", 108: "INSERTDATA", 110: "DELETEDATA", 111: "DELETEWHERE", 120: "DELETE", 121: "INSERT", 123: "USING", 126: "WITH", 128: "INTO", 129: "DEFAULT", 155: "OPTIONAL", 156: "MINUS", 158: "SERVICE", 161: "FILTER", 162: "BIND", 163: "NIL", 181: "a", 192: ";", 203: "!", 208: "^", 210: "[", 211: "]", 213: "BLANK_NODE_LABEL", 214: "ANON", 218: "||", 222: "&&", 226: "IN", 241: "-", 243: "FUNC_ARITY0", 244: "FUNC_ARITY1", 245: "FUNC_ARITY2", 246: ",", 247: "IF", 249: "BOUND", 250: "BNODE", 252: "EXISTS", 253: "COUNT", 256: "FUNC_AGGREGATE", 258: "GROUP_CONCAT", 262: "SEPARATOR", 263: "=", 265: "LANGTAG", 266: "^^", 267: "DECIMAL", 268: "DOUBLE", 269: "true", 270: "false", 271: "STRING_LITERAL1", 272: "STRING_LITERAL2", 273: "STRING_LITERAL_LONG1", 274: "STRING_LITERAL_LONG2", 275: "INTEGER_POSITIVE", 276: "DECIMAL_POSITIVE", 277: "DOUBLE_POSITIVE", 278: "INTEGER_NEGATIVE", 279: "DECIMAL_NEGATIVE", 280: "DOUBLE_NEGATIVE", 281: "PNAME_LN", 284: "DISTINCT", 285: "REDUCED", 287: "*", 290: "NAMED", 291: "SILENT", 292: "CLEAR", 293: "DROP", 294: "ADD", 295: "MOVE", 296: "COPY", 297: "ALL", 298: ".", 299: "UNION", 301: "|", 302: "/", 304: "?", 305: "+", 306: "!=", 307: "<", 308: ">", 309: "<=", 310: ">=", 311: "NOT", 312: "CONCAT", 313: "COALESCE", 314: "SUBSTR", 315: "REGEX", 316: "REPLACE" },
	        productions_: [0, [3, 3], [7, 2], [10, 2], [13, 3], [16, 4], [21, 4], [17, 3], [26, 1], [26, 5], [32, 5], [32, 7], [41, 5], [46, 4], [49, 3], [19, 2], [20, 4], [59, 3], [63, 1], [63, 1], [63, 3], [63, 5], [63, 1], [66, 2], [69, 3], [72, 2], [72, 2], [72, 1], [72, 1], [77, 2], [77, 2], [77, 4], [77, 4], [81, 2], [83, 4], [83, 6], [87, 1], [87, 1], [87, 1], [90, 3], [92, 2], [94, 4], [94, 3], [94, 5], [94, 4], [94, 2], [94, 2], [94, 2], [94, 6], [94, 6], [117, 2], [113, 2], [122, 3], [125, 2], [127, 3], [103, 1], [103, 2], [100, 2], [100, 1], [109, 4], [134, 7], [139, 3], [54, 3], [54, 3], [143, 2], [146, 3], [150, 3], [147, 2], [147, 2], [147, 2], [147, 3], [147, 4], [147, 2], [147, 6], [147, 1], [76, 1], [76, 1], [76, 1], [65, 2], [65, 6], [166, 1], [166, 4], [34, 3], [169, 3], [141, 2], [141, 2], [175, 1], [173, 2], [178, 2], [179, 1], [179, 1], [179, 1], [180, 2], [152, 2], [152, 2], [184, 4], [191, 1], [191, 3], [194, 2], [196, 2], [199, 2], [198, 2], [200, 1], [200, 1], [200, 2], [200, 3], [204, 1], [204, 1], [204, 4], [205, 1], [205, 1], [205, 2], [205, 2], [174, 3], [174, 3], [185, 3], [185, 3], [183, 1], [183, 1], [189, 1], [189, 1], [172, 1], [172, 1], [172, 1], [172, 1], [172, 1], [172, 1], [29, 2], [217, 2], [215, 2], [221, 2], [219, 1], [219, 3], [219, 4], [223, 2], [229, 2], [229, 2], [229, 2], [227, 2], [237, 2], [235, 2], [235, 2], [235, 2], [240, 1], [240, 1], [240, 1], [240, 1], [240, 1], [240, 1], [74, 3], [64, 1], [64, 2], [64, 4], [64, 6], [64, 8], [64, 2], [64, 4], [64, 2], [64, 4], [64, 3], [242, 5], [242, 5], [242, 6], [261, 4], [88, 1], [88, 2], [88, 3], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [264, 1], [264, 1], [264, 1], [264, 1], [231, 1], [231, 1], [231, 1], [233, 1], [233, 1], [233, 1], [52, 1], [52, 1], [52, 1], [282, 1], [282, 1], [4, 0], [4, 2], [5, 1], [5, 1], [8, 1], [8, 1], [8, 1], [8, 1], [9, 0], [9, 1], [18, 0], [18, 2], [22, 0], [22, 1], [283, 1], [283, 1], [24, 0], [24, 1], [286, 1], [286, 2], [25, 1], [25, 1], [35, 0], [35, 2], [36, 0], [36, 2], [39, 0], [39, 1], [288, 1], [288, 1], [289, 1], [289, 2], [43, 1], [43, 1], [44, 0], [44, 2], [45, 0], [45, 1], [48, 0], [48, 2], [51, 0], [51, 1], [53, 0], [53, 1], [55, 0], [55, 1], [56, 0], [56, 1], [57, 0], [57, 1], [58, 0], [58, 1], [62, 1], [62, 2], [68, 1], [68, 2], [71, 1], [71, 2], [84, 0], [84, 2], [85, 0], [85, 2], [86, 0], [86, 2], [91, 0], [91, 2], [93, 0], [93, 3], [96, 0], [96, 1], [97, 0], [97, 1], [98, 1], [98, 1], [99, 0], [99, 1], [101, 1], [101, 1], [101, 1], [102, 0], [102, 1], [106, 0], [106, 1], [112, 0], [112, 1], [114, 0], [114, 1], [115, 0], [115, 2], [116, 0], [116, 1], [118, 0], [118, 1], [119, 0], [119, 2], [124, 0], [124, 1], [130, 0], [130, 1], [131, 1], [131, 1], [131, 1], [132, 0], [132, 1], [133, 0], [133, 2], [135, 1], [135, 1], [136, 0], [136, 1], [137, 0], [137, 1], [138, 0], [138, 1], [140, 0], [140, 3], [142, 0], [142, 1], [144, 0], [144, 1], [145, 0], [145, 2], [148, 0], [148, 1], [149, 0], [149, 1], [151, 0], [151, 3], [153, 0], [153, 1], [154, 0], [154, 3], [157, 1], [157, 1], [159, 0], [159, 1], [160, 1], [160, 1], [164, 0], [164, 1], [165, 0], [165, 3], [167, 0], [167, 3], [168, 0], [168, 1], [170, 0], [170, 3], [171, 0], [171, 1], [176, 0], [176, 1], [300, 1], [300, 2], [177, 0], [177, 3], [182, 0], [182, 3], [186, 0], [186, 1], [187, 1], [187, 1], [188, 0], [188, 3], [190, 0], [190, 2], [193, 1], [193, 1], [195, 0], [195, 3], [197, 0], [197, 3], [303, 1], [303, 1], [303, 1], [201, 0], [201, 1], [202, 0], [202, 1], [206, 0], [206, 3], [207, 0], [207, 1], [209, 1], [209, 2], [212, 1], [212, 2], [216, 0], [216, 2], [220, 0], [220, 2], [224, 1], [224, 1], [224, 1], [224, 1], [224, 1], [224, 1], [225, 0], [225, 1], [228, 0], [228, 2], [230, 1], [230, 1], [232, 0], [232, 2], [234, 0], [234, 2], [236, 0], [236, 2], [238, 1], [238, 1], [239, 0], [239, 1], [248, 1], [248, 1], [248, 1], [248, 1], [248, 1], [251, 0], [251, 1], [254, 0], [254, 1], [255, 1], [255, 1], [257, 0], [257, 1], [259, 0], [259, 1], [260, 0], [260, 1]],
	        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
	            /* this == yyval */

	            var $0 = $$.length - 1;
	            switch (yystate) {
	                case 1:

	                    if (Parser.base) $$[$0 - 1].base = Parser.base;
	                    Parser.base = base = basePath = baseRoot = '';
	                    $$[$0 - 1].prefixes = Parser.prefixes;
	                    $$[$0 - 1].missingPrefixes = Parser.missingPrefixes;
	                    Parser.prefixes = null;
	                    return $$[$0 - 1];

	                    break;
	                case 2:
	                    this.$ = extend($$[$0 - 1], $$[$0], { type: 'query' });
	                    break;
	                case 3:

	                    Parser.base = resolveIRI($$[$0]);
	                    base = basePath = baseRoot = '';

	                    break;
	                case 4:

	                    if (!Parser.prefixes) Parser.prefixes = {};
	                    $$[$0 - 1] = $$[$0 - 1].substr(0, $$[$0 - 1].length - 1);
	                    $$[$0] = resolveIRI($$[$0]);
	                    Parser.prefixes[$$[$0 - 1]] = $$[$0];

	                    break;
	                case 5:
	                    this.$ = extend($$[$0 - 3], groupDatasets($$[$0 - 2]), $$[$0 - 1], $$[$0]);
	                    break;
	                case 6:
	                    this.$ = extend({ type: 'query' }, $$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0]);
	                    break;
	                case 7:
	                    this.$ = extend({ queryType: 'SELECT', variables: $$[$0] === '*' ? ['*'] : $$[$0] }, $$[$0 - 1] && ($$[$0 - 2] = lowercase($$[$0 - 1]), $$[$0 - 1] = {}, $$[$0 - 1][$$[$0 - 2]] = true, $$[$0 - 1]));
	                    break;
	                case 8:case 89:case 121:case 148:
	                    this.$ = toVar($$[$0]);
	                    break;
	                case 9:case 21:
	                    this.$ = expression($$[$0 - 3], { variable: toVar($$[$0 - 1]) });
	                    break;
	                case 10:
	                    this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0 - 3] }, groupDatasets($$[$0 - 2]), $$[$0 - 1], $$[$0]);
	                    break;
	                case 11:
	                    this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0 - 2] = $$[$0 - 2] ? $$[$0 - 2].triples : [] }, groupDatasets($$[$0 - 5]), { where: [{ type: 'bgp', triples: appendAllTo([], $$[$0 - 2]) }] }, $$[$0]);
	                    break;
	                case 12:
	                    this.$ = extend({ queryType: 'DESCRIBE', variables: $$[$0 - 3] === '*' ? ['*'] : $$[$0 - 3].map(toVar) }, groupDatasets($$[$0 - 2]), $$[$0 - 1], $$[$0]);
	                    break;
	                case 13:
	                    this.$ = extend({ queryType: 'ASK' }, groupDatasets($$[$0 - 2]), $$[$0 - 1], $$[$0]);
	                    break;
	                case 14:case 52:
	                    this.$ = { iri: $$[$0], named: !!$$[$0 - 1] };
	                    break;
	                case 15:
	                    this.$ = { where: $$[$0].patterns };
	                    break;
	                case 16:
	                    this.$ = extend($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0]);
	                    break;
	                case 17:
	                    this.$ = { group: $$[$0] };
	                    break;
	                case 18:case 19:case 25:case 27:
	                    this.$ = expression($$[$0]);
	                    break;
	                case 20:
	                    this.$ = expression($$[$0 - 1]);
	                    break;
	                case 22:case 28:
	                    this.$ = expression(toVar($$[$0]));
	                    break;
	                case 23:
	                    this.$ = { having: $$[$0] };
	                    break;
	                case 24:
	                    this.$ = { order: $$[$0] };
	                    break;
	                case 26:
	                    this.$ = expression($$[$0], { descending: true });
	                    break;
	                case 29:
	                    this.$ = { limit: toInt($$[$0]) };
	                    break;
	                case 30:
	                    this.$ = { offset: toInt($$[$0]) };
	                    break;
	                case 31:
	                    this.$ = { limit: toInt($$[$0 - 2]), offset: toInt($$[$0]) };
	                    break;
	                case 32:
	                    this.$ = { limit: toInt($$[$0]), offset: toInt($$[$0 - 2]) };
	                    break;
	                case 33:
	                    this.$ = { type: 'values', values: $$[$0] };
	                    break;
	                case 34:

	                    $$[$0 - 3] = toVar($$[$0 - 3]);
	                    this.$ = $$[$0 - 1].map(function (v) {
	                        var o = {};o[$$[$0 - 3]] = v;return o;
	                    });

	                    break;
	                case 35:

	                    var length = $$[$0 - 4].length;
	                    $$[$0 - 4] = $$[$0 - 4].map(toVar);
	                    this.$ = $$[$0 - 1].map(function (values) {
	                        if (values.length !== length) throw Error('Inconsistent VALUES length');
	                        var valuesObject = {};
	                        for (var i = 0; i < length; i++) {
	                            valuesObject[$$[$0 - 4][i]] = values[i];
	                        }return valuesObject;
	                    });

	                    break;
	                case 38:
	                    this.$ = undefined;
	                    break;
	                case 39:case 62:case 82:case 105:case 149:
	                    this.$ = $$[$0 - 1];
	                    break;
	                case 40:
	                    this.$ = { type: 'update', updates: appendTo($$[$0 - 1], $$[$0]) };
	                    break;
	                case 41:
	                    this.$ = extend({ type: 'load', silent: !!$$[$0 - 2], source: $$[$0 - 1] }, $$[$0] && { destination: $$[$0] });
	                    break;
	                case 42:
	                    this.$ = { type: lowercase($$[$0 - 2]), silent: !!$$[$0 - 1], graph: $$[$0] };
	                    break;
	                case 43:
	                    this.$ = { type: lowercase($$[$0 - 4]), silent: !!$$[$0 - 3], source: $$[$0 - 2], destination: $$[$0] };
	                    break;
	                case 44:
	                    this.$ = { type: 'create', silent: !!$$[$0 - 2], graph: $$[$0 - 1] };
	                    break;
	                case 45:
	                    this.$ = { updateType: 'insert', insert: $$[$0] };
	                    break;
	                case 46:
	                    this.$ = { updateType: 'delete', delete: $$[$0] };
	                    break;
	                case 47:
	                    this.$ = { updateType: 'deletewhere', delete: $$[$0] };
	                    break;
	                case 48:
	                    this.$ = extend({ updateType: 'insertdelete' }, $$[$0 - 5], { insert: $$[$0 - 4] || [] }, { delete: $$[$0 - 3] || [] }, groupDatasets($$[$0 - 2]), { where: $$[$0].patterns });
	                    break;
	                case 49:
	                    this.$ = extend({ updateType: 'insertdelete' }, $$[$0 - 5], { delete: $$[$0 - 4] || [] }, { insert: $$[$0 - 3] || [] }, groupDatasets($$[$0 - 2]), { where: $$[$0].patterns });
	                    break;
	                case 50:case 51:case 54:case 140:
	                    this.$ = $$[$0];
	                    break;
	                case 53:
	                    this.$ = { graph: $$[$0] };
	                    break;
	                case 55:
	                    this.$ = { type: 'graph', default: true };
	                    break;
	                case 56:case 57:
	                    this.$ = { type: 'graph', name: $$[$0] };
	                    break;
	                case 58:
	                    this.$ = {};this.$[lowercase($$[$0])] = true;
	                    break;
	                case 59:
	                    this.$ = $$[$0 - 2] ? unionAll($$[$0 - 1], [$$[$0 - 2]]) : unionAll($$[$0 - 1]);
	                    break;
	                case 60:

	                    var graph = extend($$[$0 - 3] || { triples: [] }, { type: 'graph', name: toVar($$[$0 - 5]) });
	                    this.$ = $$[$0] ? [graph, $$[$0]] : [graph];

	                    break;
	                case 61:case 66:
	                    this.$ = { type: 'bgp', triples: unionAll($$[$0 - 2], [$$[$0 - 1]]) };
	                    break;
	                case 63:

	                    // Simplify the groups by merging adjacent BGPs
	                    if ($$[$0 - 1].length > 1) {
	                        var groups = [],
	                            currentBgp;
	                        for (var i = 0, group; group = $$[$0 - 1][i]; i++) {
	                            switch (group.type) {
	                                // Add a BGP's triples to the current BGP
	                                case 'bgp':
	                                    if (group.triples.length) {
	                                        if (!currentBgp) appendTo(groups, currentBgp = group);else appendAllTo(currentBgp.triples, group.triples);
	                                    }
	                                    break;
	                                // All other groups break up a BGP
	                                default:
	                                    // Only add the group if its pattern is non-empty
	                                    if (!group.patterns || group.patterns.length > 0) {
	                                        appendTo(groups, group);
	                                        currentBgp = null;
	                                    }
	                            }
	                        }
	                        $$[$0 - 1] = groups;
	                    }
	                    this.$ = { type: 'group', patterns: $$[$0 - 1] };

	                    break;
	                case 64:
	                    this.$ = $$[$0 - 1] ? unionAll([$$[$0 - 1]], $$[$0]) : unionAll($$[$0]);
	                    break;
	                case 65:
	                    this.$ = $$[$0] ? [$$[$0 - 2], $$[$0]] : $$[$0 - 2];
	                    break;
	                case 67:
	                    this.$ = $$[$0 - 1].length ? { type: 'union', patterns: unionAll($$[$0 - 1].map(degroupSingle), [degroupSingle($$[$0])]) } : degroupSingle($$[$0]);
	                    break;
	                case 68:
	                    this.$ = extend($$[$0], { type: 'optional' });
	                    break;
	                case 69:
	                    this.$ = extend($$[$0], { type: 'minus' });
	                    break;
	                case 70:
	                    this.$ = extend($$[$0], { type: 'graph', name: toVar($$[$0 - 1]) });
	                    break;
	                case 71:
	                    this.$ = extend($$[$0], { type: 'service', name: toVar($$[$0 - 1]), silent: !!$$[$0 - 2] });
	                    break;
	                case 72:
	                    this.$ = { type: 'filter', expression: $$[$0] };
	                    break;
	                case 73:
	                    this.$ = { type: 'bind', variable: toVar($$[$0 - 1]), expression: $$[$0 - 3] };
	                    break;
	                case 78:
	                    this.$ = { type: 'functionCall', function: $$[$0 - 1], args: [] };
	                    break;
	                case 79:
	                    this.$ = { type: 'functionCall', function: $$[$0 - 5], args: appendTo($$[$0 - 2], $$[$0 - 1]), distinct: !!$$[$0 - 3] };
	                    break;
	                case 80:case 96:case 107:case 189:case 199:case 211:case 213:case 223:case 227:case 247:case 249:case 251:case 253:case 255:case 276:case 282:case 293:case 303:case 309:case 315:case 319:case 329:case 331:case 335:case 343:case 345:case 351:case 353:case 357:case 359:case 368:case 376:case 378:case 388:case 392:case 394:case 396:
	                    this.$ = [];
	                    break;
	                case 81:
	                    this.$ = appendTo($$[$0 - 2], $$[$0 - 1]);
	                    break;
	                case 83:
	                    this.$ = unionAll($$[$0 - 2], [$$[$0 - 1]]);
	                    break;
	                case 84:case 93:
	                    this.$ = $$[$0].map(function (t) {
	                        return extend(triple($$[$0 - 1]), t);
	                    });
	                    break;
	                case 85:
	                    this.$ = appendAllTo($$[$0].map(function (t) {
	                        return extend(triple($$[$0 - 1].entity), t);
	                    }), $$[$0 - 1].triples) /* the subject is a blank node, possibly with more triples */;
	                    break;
	                case 87:
	                    this.$ = unionAll($$[$0 - 1], [$$[$0]]);
	                    break;
	                case 88:
	                    this.$ = objectListToTriples($$[$0 - 1], $$[$0]);
	                    break;
	                case 91:case 103:case 110:
	                    this.$ = RDF_TYPE;
	                    break;
	                case 92:
	                    this.$ = appendTo($$[$0 - 1], $$[$0]);
	                    break;
	                case 94:
	                    this.$ = !$$[$0] ? $$[$0 - 1].triples : appendAllTo($$[$0].map(function (t) {
	                        return extend(triple($$[$0 - 1].entity), t);
	                    }), $$[$0 - 1].triples) /* the subject is a blank node, possibly with more triples */;
	                    break;
	                case 95:
	                    this.$ = objectListToTriples(toVar($$[$0 - 3]), appendTo($$[$0 - 2], $$[$0 - 1]), $$[$0]);
	                    break;
	                case 97:
	                    this.$ = objectListToTriples(toVar($$[$0 - 1]), $$[$0]);
	                    break;
	                case 98:
	                    this.$ = $$[$0 - 1].length ? path('|', appendTo($$[$0 - 1], $$[$0])) : $$[$0];
	                    break;
	                case 99:
	                    this.$ = $$[$0 - 1].length ? path('/', appendTo($$[$0 - 1], $$[$0])) : $$[$0];
	                    break;
	                case 100:
	                    this.$ = $$[$0] ? path($$[$0], [$$[$0 - 1]]) : $$[$0 - 1];
	                    break;
	                case 101:
	                    this.$ = $$[$0 - 1] ? path($$[$0 - 1], [$$[$0]]) : $$[$0];;
	                    break;
	                case 104:case 111:
	                    this.$ = path($$[$0 - 1], [$$[$0]]);
	                    break;
	                case 108:
	                    this.$ = path('|', appendTo($$[$0 - 2], $$[$0 - 1]));
	                    break;
	                case 112:
	                    this.$ = path($$[$0 - 1], [RDF_TYPE]);
	                    break;
	                case 113:case 115:
	                    this.$ = createList($$[$0 - 1]);
	                    break;
	                case 114:case 116:
	                    this.$ = createAnonymousObject($$[$0 - 1]);
	                    break;
	                case 117:
	                    this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNode */;
	                    break;
	                case 119:
	                    this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNodePath */;
	                    break;
	                case 125:
	                    this.$ = blank();
	                    break;
	                case 126:
	                    this.$ = RDF_NIL;
	                    break;
	                case 127:case 129:case 134:case 138:
	                    this.$ = createOperationTree($$[$0 - 1], $$[$0]);
	                    break;
	                case 128:
	                    this.$ = ['||', $$[$0]];
	                    break;
	                case 130:
	                    this.$ = ['&&', $$[$0]];
	                    break;
	                case 132:
	                    this.$ = operation($$[$0 - 1], [$$[$0 - 2], $$[$0]]);
	                    break;
	                case 133:
	                    this.$ = operation($$[$0 - 2] ? 'notin' : 'in', [$$[$0 - 3], $$[$0]]);
	                    break;
	                case 135:case 139:
	                    this.$ = [$$[$0 - 1], $$[$0]];
	                    break;
	                case 136:
	                    this.$ = ['+', createOperationTree($$[$0 - 1], $$[$0])];
	                    break;
	                case 137:
	                    this.$ = ['-', createOperationTree($$[$0 - 1].replace('-', ''), $$[$0])];
	                    break;
	                case 141:
	                    this.$ = operation($$[$0 - 1], [$$[$0]]);
	                    break;
	                case 142:
	                    this.$ = operation('UMINUS', [$$[$0]]);
	                    break;
	                case 151:
	                    this.$ = operation(lowercase($$[$0 - 1]));
	                    break;
	                case 152:
	                    this.$ = operation(lowercase($$[$0 - 3]), [$$[$0 - 1]]);
	                    break;
	                case 153:
	                    this.$ = operation(lowercase($$[$0 - 5]), [$$[$0 - 3], $$[$0 - 1]]);
	                    break;
	                case 154:
	                    this.$ = operation(lowercase($$[$0 - 7]), [$$[$0 - 5], $$[$0 - 3], $$[$0 - 1]]);
	                    break;
	                case 155:
	                    this.$ = operation(lowercase($$[$0 - 1]), $$[$0]);
	                    break;
	                case 156:
	                    this.$ = operation('bound', [toVar($$[$0 - 1])]);
	                    break;
	                case 157:
	                    this.$ = operation($$[$0 - 1], []);
	                    break;
	                case 158:
	                    this.$ = operation($$[$0 - 3], [$$[$0 - 1]]);
	                    break;
	                case 159:
	                    this.$ = operation($$[$0 - 2] ? 'notexists' : 'exists', [degroupSingle($$[$0])]);
	                    break;
	                case 160:case 161:
	                    this.$ = expression($$[$0 - 1], { type: 'aggregate', aggregation: lowercase($$[$0 - 4]), distinct: !!$$[$0 - 2] });
	                    break;
	                case 162:
	                    this.$ = expression($$[$0 - 2], { type: 'aggregate', aggregation: lowercase($$[$0 - 5]), distinct: !!$$[$0 - 3], separator: $$[$0 - 1] || ' ' });
	                    break;
	                case 163:
	                    this.$ = $$[$0].substr(1, $$[$0].length - 2);
	                    break;
	                case 165:
	                    this.$ = $$[$0 - 1] + lowercase($$[$0]);
	                    break;
	                case 166:
	                    this.$ = $$[$0 - 2] + '^^' + $$[$0];
	                    break;
	                case 167:case 181:
	                    this.$ = createLiteral($$[$0], XSD_INTEGER);
	                    break;
	                case 168:case 182:
	                    this.$ = createLiteral($$[$0], XSD_DECIMAL);
	                    break;
	                case 169:case 183:
	                    this.$ = createLiteral(lowercase($$[$0]), XSD_DOUBLE);
	                    break;
	                case 172:
	                    this.$ = XSD_TRUE;
	                    break;
	                case 173:
	                    this.$ = XSD_FALSE;
	                    break;
	                case 174:case 175:
	                    this.$ = unescapeString($$[$0], 1);
	                    break;
	                case 176:case 177:
	                    this.$ = unescapeString($$[$0], 3);
	                    break;
	                case 178:
	                    this.$ = createLiteral($$[$0].substr(1), XSD_INTEGER);
	                    break;
	                case 179:
	                    this.$ = createLiteral($$[$0].substr(1), XSD_DECIMAL);
	                    break;
	                case 180:
	                    this.$ = createLiteral($$[$0].substr(1).toLowerCase(), XSD_DOUBLE);
	                    break;
	                case 184:
	                    this.$ = resolveIRI($$[$0]);
	                    break;
	                case 185:

	                    var namePos = $$[$0].indexOf(':'),
	                        prefix = $$[$0].substr(0, namePos),
	                        expansion = Parser.prefixes[prefix];
	                    if (!expansion) {
	                        this.$ = resolveIRI($$[$0]);
	                        if (Parser.missingPrefixes.indexOf(prefix) === -1) Parser.missingPrefixes.push(prefix);
	                    } else {
	                        this.$ = resolveIRI(expansion + $$[$0].substr(namePos + 1));
	                    }

	                    break;
	                case 186:

	                    $$[$0] = $$[$0].substr(0, $$[$0].length - 1);
	                    if (!($$[$0] in Parser.prefixes)) throw new Error('Unknown prefix: ' + $$[$0]);
	                    this.$ = resolveIRI(Parser.prefixes[$$[$0]]);

	                    break;
	                case 190:case 200:case 208:case 212:case 214:case 220:case 224:case 228:case 242:case 244:case 246:case 248:case 250:case 252:case 254:case 277:case 283:case 294:case 310:case 342:case 354:case 373:case 375:case 377:case 379:case 389:case 393:case 395:case 397:
	                    $$[$0 - 1].push($$[$0]);
	                    break;
	                case 207:case 219:case 241:case 243:case 245:case 341:case 372:case 374:
	                    this.$ = [$$[$0]];
	                    break;
	                case 256:case 304:case 316:case 320:case 330:case 332:case 336:case 344:case 346:case 352:case 358:case 360:case 369:
	                    $$[$0 - 2].push($$[$0 - 1]);
	                    break;
	            }
	        },
	        table: [o($V0, [2, 189], { 3: 1, 4: 2 }), { 1: [3] }, o($V1, [2, 255], { 5: 3, 282: 4, 7: 5, 92: 6, 10: 7, 13: 8, 8: 9, 93: 10, 16: 13, 32: 14, 41: 15, 46: 16, 17: 17, 11: [1, 11], 14: [1, 12], 23: $V2, 33: [1, 18], 42: [1, 19], 47: [1, 20] }), { 6: [1, 22] }, o($V0, [2, 190]), { 6: [2, 191] }, { 6: [2, 192] }, o($V0, [2, 187]), o($V0, [2, 188]), { 6: [2, 197], 9: 23, 81: 24, 82: $V3 }, { 94: 26, 95: [1, 27], 98: 28, 101: 29, 105: [1, 30], 108: [1, 31], 110: [1, 32], 111: [1, 33], 112: 34, 116: 35, 120: [2, 278], 121: [2, 272], 125: 41, 126: [1, 42], 292: [1, 36], 293: [1, 37], 294: [1, 38], 295: [1, 39], 296: [1, 40] }, { 12: [1, 43] }, { 15: [1, 44] }, o($V4, [2, 193]), o($V4, [2, 194]), o($V4, [2, 195]), o($V4, [2, 196]), o($V5, [2, 199], { 18: 45 }), o($V6, [2, 213], { 34: 46, 36: 47, 38: [1, 48] }), { 12: $V7, 15: $V8, 27: $V9, 43: 49, 52: 54, 281: $Va, 287: [1, 51], 288: 52, 289: 50 }, o($V5, [2, 227], { 48: 58 }), o($Vb, [2, 205], { 24: 59, 283: 60, 284: [1, 61], 285: [1, 62] }), { 1: [2, 1] }, { 6: [2, 2] }, { 6: [2, 198] }, { 27: [1, 64], 28: [1, 65], 83: 63 }, { 6: [2, 40], 192: [1, 66] }, o($Vc, [2, 257], { 96: 67, 291: [1, 68] }), o($Vd, [2, 263], { 99: 69, 291: [1, 70] }), o($Ve, [2, 268], { 102: 71, 291: [1, 72] }), { 106: 73, 107: [2, 270], 291: [1, 74] }, { 38: $Vf, 109: 75 }, { 38: $Vf, 109: 77 }, { 38: $Vf, 109: 78 }, { 113: 79, 121: $Vg }, { 117: 81, 120: $Vh }, o($Vi, [2, 261]), o($Vi, [2, 262]), o($Vj, [2, 265]), o($Vj, [2, 266]), o($Vj, [2, 267]), { 120: [2, 279], 121: [2, 273] }, { 12: $V7, 15: $V8, 52: 83, 281: $Va }, o($V0, [2, 3]), { 12: [1, 84] }, { 19: 85, 37: $Vk, 38: $Vl, 49: 86, 50: $Vm, 53: 87 }, o($V5, [2, 211], { 35: 90 }), { 37: [1, 91], 49: 92, 50: $Vm }, o($Vn, [2, 335], { 168: 93, 169: 94, 170: 95, 40: [2, 333] }), o($Vo, [2, 223], { 44: 96 }), o($Vo, [2, 221], { 52: 54, 288: 97, 12: $V7, 15: $V8, 27: $V9, 281: $Va }), o($Vo, [2, 222]), o($Vp, [2, 219]), o($Vp, [2, 217]), o($Vp, [2, 218]), o($Vq, [2, 184]), o($Vq, [2, 185]), o($Vq, [2, 186]), { 19: 98, 37: $Vk, 38: $Vl, 49: 99, 50: $Vm, 53: 87 }, { 25: 100, 26: 103, 27: $Vr, 28: $Vs, 286: 101, 287: [1, 102] }, o($Vb, [2, 206]), o($Vb, [2, 203]), o($Vb, [2, 204]), o($Vt, [2, 33]), { 38: [1, 106] }, o($Vu, [2, 249], { 85: 107 }), o($V1, [2, 256]), { 12: $V7, 15: $V8, 52: 108, 281: $Va }, o($Vc, [2, 258]), { 100: 109, 107: [1, 110], 129: [1, 112], 131: 111, 290: [1, 113], 297: [1, 114] }, o($Vd, [2, 264]), o($Vc, $Vv, { 103: 115, 130: 117, 107: $Vw, 129: $Vx }), o($Ve, [2, 269]), { 107: [1, 119] }, { 107: [2, 271] }, o($Vy, [2, 45]), o($Vn, $Vz, { 132: 120, 139: 121, 140: 122, 40: $VA, 107: $VA }), o($Vy, [2, 46]), o($Vy, [2, 47]), o($VB, [2, 274], { 114: 123, 117: 124, 120: $Vh }), { 38: $Vf, 109: 125 }, o($VB, [2, 280], { 118: 126, 113: 127, 121: $Vg }), { 38: $Vf, 109: 128 }, o([120, 121], [2, 53]), o($V0, [2, 4]), o($VC, $VD, { 20: 129, 55: 130, 59: 131, 60: $VE }), o($V5, [2, 200]), { 38: $VF, 54: 133 }, o($Vc, [2, 229], { 51: 135, 290: [1, 136] }), { 38: [2, 232] }, { 19: 137, 37: $Vk, 38: $Vl, 49: 138, 50: $Vm, 53: 87 }, { 38: [1, 139] }, o($V6, [2, 214]), { 40: [1, 140] }, { 40: [2, 334] }, { 12: $V7, 15: $V8, 27: $VG, 28: $VH, 52: 145, 79: $VI, 88: 146, 141: 141, 163: $VJ, 172: 142, 174: 143, 210: $VK, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($V$, [2, 225], { 53: 87, 45: 170, 49: 171, 19: 172, 37: $Vk, 38: $Vl, 50: $Vm }), o($Vp, [2, 220]), o($VC, $VD, { 55: 130, 59: 131, 20: 173, 60: $VE }), o($V5, [2, 228]), o($V5, [2, 7]), o($V5, [2, 209], { 26: 174, 27: $Vr, 28: $Vs }), o($V5, [2, 210]), o($V01, [2, 207]), o($V01, [2, 8]), o($V11, $V21, { 29: 175, 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 203: $V31, 241: $V41, 305: $V51 }), o($V61, [2, 247], { 84: 185 }), { 27: [1, 187], 31: [1, 186] }, o($Vy, [2, 259], { 97: 188, 127: 189, 128: [1, 190] }), o($Vy, [2, 42]), { 12: $V7, 15: $V8, 52: 191, 281: $Va }, o($Vy, [2, 58]), o($Vy, [2, 288]), o($Vy, [2, 289]), o($Vy, [2, 290]), { 104: [1, 192] }, o($V71, [2, 55]), { 12: $V7, 15: $V8, 52: 193, 281: $Va }, o($Vc, [2, 287]), { 12: $V7, 15: $V8, 52: 194, 281: $Va }, o($V81, [2, 293], { 133: 195 }), o($V81, [2, 292]), { 12: $V7, 15: $V8, 27: $VG, 28: $VH, 52: 145, 79: $VI, 88: 146, 141: 196, 163: $VJ, 172: 142, 174: 143, 210: $VK, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($VB, [2, 276], { 115: 197 }), o($VB, [2, 275]), o([37, 120, 123], [2, 51]), o($VB, [2, 282], { 119: 198 }), o($VB, [2, 281]), o([37, 121, 123], [2, 50]), o($V4, [2, 5]), o($V91, [2, 235], { 56: 199, 66: 200, 67: [1, 201] }), o($VC, [2, 234]), { 61: [1, 202] }, o([6, 40, 60, 67, 70, 78, 80, 82], [2, 15]), o($Vn, $Va1, { 21: 203, 143: 204, 17: 205, 144: 206, 150: 207, 151: 208, 23: $V2, 38: $Vb1, 40: $Vb1, 82: $Vb1, 107: $Vb1, 155: $Vb1, 156: $Vb1, 158: $Vb1, 161: $Vb1, 162: $Vb1 }), { 12: $V7, 15: $V8, 52: 209, 281: $Va }, o($Vc, [2, 230]), o($VC, $VD, { 55: 130, 59: 131, 20: 210, 60: $VE }), o($V5, [2, 212]), o($Vn, $Vz, { 140: 122, 39: 211, 139: 212, 40: [2, 215] }), o($V5, [2, 82]), { 40: [2, 337], 171: 213, 298: [1, 214] }, o($Vc1, $Vd1, { 173: 215, 177: 216 }), o($Vc1, $Vd1, { 177: 216, 175: 217, 176: 218, 173: 219, 40: $Ve1, 107: $Ve1, 298: $Ve1 }), o($Vf1, [2, 121]), o($Vf1, [2, 122]), o($Vf1, [2, 123]), o($Vf1, [2, 124]), o($Vf1, [2, 125]), o($Vf1, [2, 126]), { 12: $V7, 15: $V8, 27: $VG, 28: $VH, 52: 145, 79: $VI, 88: 146, 163: $VJ, 172: 222, 174: 223, 183: 221, 209: 220, 210: $VK, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($Vc1, $Vd1, { 177: 216, 173: 224 }), o($Vg1, [2, 164], { 265: [1, 225], 266: [1, 226] }), o($Vg1, [2, 167]), o($Vg1, [2, 168]), o($Vg1, [2, 169]), o($Vg1, [2, 170]), o($Vg1, [2, 171]), o($Vg1, [2, 172]), o($Vg1, [2, 173]), o($Vh1, [2, 174]), o($Vh1, [2, 175]), o($Vh1, [2, 176]), o($Vh1, [2, 177]), o($Vg1, [2, 178]), o($Vg1, [2, 179]), o($Vg1, [2, 180]), o($Vg1, [2, 181]), o($Vg1, [2, 182]), o($Vg1, [2, 183]), o($VC, $VD, { 55: 130, 59: 131, 20: 227, 60: $VE }), o($Vo, [2, 224]), o($V$, [2, 226]), o($V4, [2, 13]), o($V01, [2, 208]), { 30: [1, 228] }, o($Vi1, [2, 376], { 216: 229 }), o($Vj1, [2, 378], { 220: 230 }), o($Vj1, [2, 131], { 224: 231, 225: 232, 226: [2, 386], 263: [1, 233], 306: [1, 234], 307: [1, 235], 308: [1, 236], 309: [1, 237], 310: [1, 238], 311: [1, 239] }), o($Vk1, [2, 388], { 228: 240 }), o($Vl1, [2, 396], { 236: 241 }), { 12: $V7, 15: $V8, 27: $Vm1, 28: $Vn1, 52: 245, 64: 244, 65: 246, 74: 243, 79: $VI, 88: 247, 231: 156, 233: 157, 240: 242, 242: 250, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 248: 255, 249: $Vs1, 250: $Vt1, 251: 258, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }, { 12: $V7, 15: $V8, 27: $Vm1, 28: $Vn1, 52: 245, 64: 244, 65: 246, 74: 243, 79: $VI, 88: 247, 231: 156, 233: 157, 240: 268, 242: 250, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 248: 255, 249: $Vs1, 250: $Vt1, 251: 258, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }, { 12: $V7, 15: $V8, 27: $Vm1, 28: $Vn1, 52: 245, 64: 244, 65: 246, 74: 243, 79: $VI, 88: 247, 231: 156, 233: 157, 240: 269, 242: 250, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 248: 255, 249: $Vs1, 250: $Vt1, 251: 258, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }, o($V11, [2, 401]), { 12: $V7, 15: $V8, 40: [1, 270], 52: 272, 79: $VI, 87: 271, 88: 273, 89: $VE1, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, { 38: [1, 275] }, o($Vu, [2, 250]), o($Vy, [2, 41]), o($Vy, [2, 260]), { 107: [1, 276] }, o($Vy, [2, 57]), o($Vc, $Vv, { 130: 117, 103: 277, 107: $Vw, 129: $Vx }), o($V71, [2, 56]), o($Vy, [2, 44]), { 40: [1, 278], 107: [1, 280], 134: 279 }, o($V81, [2, 305], { 142: 281, 298: [1, 282] }), { 37: [1, 283], 122: 284, 123: $VF1 }, { 37: [1, 286], 122: 287, 123: $VF1 }, o($VG1, [2, 237], { 57: 288, 69: 289, 70: [1, 290] }), o($V91, [2, 236]), { 12: $V7, 15: $V8, 28: $Vn1, 52: 296, 64: 294, 65: 295, 68: 291, 74: 293, 76: 292, 242: 250, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 248: 255, 249: $Vs1, 250: $Vt1, 251: 258, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }, { 12: $V7, 15: $V8, 27: $VH1, 28: $VI1, 52: 296, 62: 297, 63: 298, 64: 299, 65: 300, 242: 250, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 248: 255, 249: $Vs1, 250: $Vt1, 251: 258, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }, { 40: [1, 303] }, { 40: [1, 304] }, { 19: 305, 37: $Vk, 38: $Vl, 53: 87 }, o($VJ1, [2, 309], { 145: 306 }), o($VJ1, [2, 308]), { 12: $V7, 15: $V8, 27: $VG, 28: $VK1, 52: 145, 79: $VI, 88: 146, 152: 307, 163: $VJ, 172: 308, 185: 309, 210: $VL1, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($Vo, [2, 14]), o($V4, [2, 10]), { 40: [1, 312] }, { 40: [2, 216] }, { 40: [2, 83] }, o($Vn, [2, 336], { 40: [2, 338] }), o($VM1, [2, 84]), { 12: $V7, 15: $V8, 27: [1, 315], 52: 316, 178: 313, 179: 314, 181: [1, 317], 281: $Va }, o($VM1, [2, 85]), o($VM1, [2, 86]), o($VM1, [2, 340]), { 12: $V7, 15: $V8, 27: $VG, 28: $VH, 31: [1, 318], 52: 145, 79: $VI, 88: 146, 163: $VJ, 172: 222, 174: 223, 183: 319, 210: $VK, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($VN1, [2, 372]), o($VO1, [2, 117]), o($VO1, [2, 118]), { 211: [1, 320] }, o($Vg1, [2, 165]), { 12: $V7, 15: $V8, 52: 321, 281: $Va }, o($V4, [2, 12]), { 27: [1, 322] }, o([30, 31, 192, 246], [2, 127], { 217: 323, 218: [1, 324] }), o($Vi1, [2, 129], { 221: 325, 222: [1, 326] }), o($V11, $V21, { 227: 179, 235: 180, 239: 181, 223: 327, 203: $V31, 241: $V41, 305: $V51 }), { 226: [1, 328] }, o($VP1, [2, 380]), o($VP1, [2, 381]), o($VP1, [2, 382]), o($VP1, [2, 383]), o($VP1, [2, 384]), o($VP1, [2, 385]), { 226: [2, 387] }, o([30, 31, 192, 218, 222, 226, 246, 263, 306, 307, 308, 309, 310, 311], [2, 134], { 229: 329, 230: 330, 231: 331, 233: 332, 241: [1, 334], 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 305: [1, 333] }), o($Vk1, [2, 138], { 237: 335, 238: 336, 287: $VQ1, 302: $VR1 }), o($Vl1, [2, 140]), o($Vl1, [2, 143]), o($Vl1, [2, 144]), o($Vl1, [2, 145], { 28: $VS1, 163: $VT1 }), o($Vl1, [2, 146]), o($Vl1, [2, 147]), o($Vl1, [2, 148]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 341, 203: $V31, 241: $V41, 305: $V51 }), o($VU1, [2, 150]), { 163: [1, 342] }, { 28: [1, 343] }, { 28: [1, 344] }, { 28: [1, 345] }, { 28: $VV1, 163: $VW1, 166: 346 }, { 28: [1, 349] }, { 28: [1, 351], 163: [1, 350] }, { 252: [1, 352] }, { 28: [1, 353] }, { 28: [1, 354] }, { 28: [1, 355] }, o($VX1, [2, 402]), o($VX1, [2, 403]), o($VX1, [2, 404]), o($VX1, [2, 405]), o($VX1, [2, 406]), { 252: [2, 408] }, o($Vl1, [2, 141]), o($Vl1, [2, 142]), o($Vt, [2, 34]), o($V61, [2, 248]), o($VY1, [2, 36]), o($VY1, [2, 37]), o($VY1, [2, 38]), o($VZ1, [2, 251], { 86: 356 }), { 12: $V7, 15: $V8, 52: 357, 281: $Va }, o($Vy, [2, 43]), o([6, 37, 120, 121, 123, 192], [2, 59]), o($V81, [2, 294]), { 12: $V7, 15: $V8, 27: [1, 359], 52: 360, 135: 358, 281: $Va }, o($V81, [2, 61]), o($Vn, [2, 304], { 40: $V_1, 107: $V_1 }), { 38: $VF, 54: 361 }, o($VB, [2, 277]), o($Vc, [2, 284], { 124: 362, 290: [1, 363] }), { 38: $VF, 54: 364 }, o($VB, [2, 283]), o($V$1, [2, 239], { 58: 365, 77: 366, 78: [1, 367], 80: [1, 368] }), o($VG1, [2, 238]), { 61: [1, 369] }, o($V91, [2, 23], { 242: 250, 248: 255, 251: 258, 74: 293, 64: 294, 65: 295, 52: 296, 76: 370, 12: $V7, 15: $V8, 28: $Vn1, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 249: $Vs1, 250: $Vt1, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }), o($V02, [2, 243]), o($V12, [2, 75]), o($V12, [2, 76]), o($V12, [2, 77]), { 28: $VS1, 163: $VT1 }, o($VC, [2, 17], { 242: 250, 248: 255, 251: 258, 52: 296, 64: 299, 65: 300, 63: 371, 12: $V7, 15: $V8, 27: $VH1, 28: $VI1, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 249: $Vs1, 250: $Vt1, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }), o($V22, [2, 241]), o($V22, [2, 18]), o($V22, [2, 19]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 372, 203: $V31, 241: $V41, 305: $V51 }), o($V22, [2, 22]), o($V32, [2, 62]), o($V32, [2, 63]), o($VC, $VD, { 55: 130, 59: 131, 20: 373, 60: $VE }), { 38: [2, 319], 40: [2, 64], 81: 383, 82: $V3, 107: [1, 379], 146: 374, 147: 375, 154: 376, 155: [1, 377], 156: [1, 378], 158: [1, 380], 161: [1, 381], 162: [1, 382] }, o($VJ1, [2, 317], { 153: 384, 298: [1, 385] }), o($V42, $V52, { 184: 386, 187: 387, 194: 388, 195: 390, 27: $V62 }), o($V72, [2, 347], { 187: 387, 194: 388, 195: 390, 186: 391, 184: 392, 12: $V52, 15: $V52, 28: $V52, 181: $V52, 203: $V52, 208: $V52, 281: $V52, 27: $V62 }), { 12: $V7, 15: $V8, 27: $VG, 28: $VK1, 52: 145, 79: $VI, 88: 146, 163: $VJ, 172: 395, 185: 396, 189: 394, 210: $VL1, 212: 393, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($V42, $V52, { 187: 387, 194: 388, 195: 390, 184: 397, 27: $V62 }), o($VC, $VD, { 55: 130, 59: 131, 20: 398, 60: $VE }), o([40, 107, 211, 298], [2, 87], { 300: 399, 192: [1, 400] }), o($Vn, $V82, { 180: 401, 182: 402 }), o($Vn, [2, 89]), o($Vn, [2, 90]), o($Vn, [2, 91]), o($V92, [2, 113]), o($VN1, [2, 373]), o($V92, [2, 114]), o($Vg1, [2, 166]), { 31: [1, 403] }, o($Vi1, [2, 377]), o($V11, $V21, { 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 215: 404, 203: $V31, 241: $V41, 305: $V51 }), o($Vj1, [2, 379]), o($V11, $V21, { 223: 178, 227: 179, 235: 180, 239: 181, 219: 405, 203: $V31, 241: $V41, 305: $V51 }), o($Vj1, [2, 132]), { 28: $VV1, 163: $VW1, 166: 406 }, o($Vk1, [2, 389]), o($V11, $V21, { 235: 180, 239: 181, 227: 407, 203: $V31, 241: $V41, 305: $V51 }), o($Vl1, [2, 392], { 232: 408 }), o($Vl1, [2, 394], { 234: 409 }), o($VP1, [2, 390]), o($VP1, [2, 391]), o($Vl1, [2, 397]), o($V11, $V21, { 239: 181, 235: 410, 203: $V31, 241: $V41, 305: $V51 }), o($VP1, [2, 398]), o($VP1, [2, 399]), o($VU1, [2, 78]), o($VP1, [2, 327], { 164: 411, 284: [1, 412] }), { 31: [1, 413] }, o($VU1, [2, 151]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 414, 203: $V31, 241: $V41, 305: $V51 }), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 415, 203: $V31, 241: $V41, 305: $V51 }), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 416, 203: $V31, 241: $V41, 305: $V51 }), o($VU1, [2, 155]), o($VU1, [2, 80]), o($VP1, [2, 331], { 167: 417 }), { 27: [1, 418] }, o($VU1, [2, 157]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 419, 203: $V31, 241: $V41, 305: $V51 }), { 38: $VF, 54: 420 }, o($Va2, [2, 409], { 254: 421, 284: [1, 422] }), o($VP1, [2, 413], { 257: 423, 284: [1, 424] }), o($VP1, [2, 415], { 259: 425, 284: [1, 426] }), { 28: [1, 429], 40: [1, 427], 90: 428 }, o($Vy, [2, 54]), { 38: [1, 430] }, { 38: [2, 295] }, { 38: [2, 296] }, o($Vy, [2, 48]), { 12: $V7, 15: $V8, 52: 431, 281: $Va }, o($Vc, [2, 285]), o($Vy, [2, 49]), o($V$1, [2, 16]), o($V$1, [2, 240]), { 79: [1, 432] }, { 79: [1, 433] }, { 12: $V7, 15: $V8, 27: $Vb2, 28: $Vn1, 52: 296, 64: 294, 65: 295, 71: 434, 72: 435, 73: $Vc2, 74: 293, 75: $Vd2, 76: 438, 242: 250, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 248: 255, 249: $Vs1, 250: $Vt1, 251: 258, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }, o($V02, [2, 244]), o($V22, [2, 242]), { 30: [1, 441], 31: [1, 440] }, { 22: 442, 40: [2, 201], 81: 443, 82: $V3 }, o($VJ1, [2, 310]), o($Ve2, [2, 311], { 148: 444, 298: [1, 445] }), { 38: $VF, 54: 446 }, { 38: $VF, 54: 447 }, { 38: $VF, 54: 448 }, { 12: $V7, 15: $V8, 27: [1, 450], 52: 451, 157: 449, 281: $Va }, o($Vf2, [2, 323], { 159: 452, 291: [1, 453] }), { 12: $V7, 15: $V8, 28: $Vn1, 52: 296, 64: 294, 65: 295, 74: 293, 76: 454, 242: 250, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 248: 255, 249: $Vs1, 250: $Vt1, 251: 258, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }, { 28: [1, 455] }, o($Vg2, [2, 74]), o($VJ1, [2, 66]), o($Vn, [2, 316], { 38: $Vh2, 40: $Vh2, 82: $Vh2, 107: $Vh2, 155: $Vh2, 156: $Vh2, 158: $Vh2, 161: $Vh2, 162: $Vh2 }), o($V72, [2, 93]), o($Vn, [2, 351], { 188: 456 }), o($Vn, [2, 349]), o($Vn, [2, 350]), o($V42, [2, 359], { 196: 457, 197: 458 }), o($V72, [2, 94]), o($V72, [2, 348]), { 12: $V7, 15: $V8, 27: $VG, 28: $VK1, 31: [1, 459], 52: 145, 79: $VI, 88: 146, 163: $VJ, 172: 395, 185: 396, 189: 460, 210: $VL1, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($VN1, [2, 374]), o($VO1, [2, 119]), o($VO1, [2, 120]), { 211: [1, 461] }, o($V4, [2, 11]), o($Vc1, [2, 344], { 192: [1, 462] }), o($Vi2, [2, 341]), o([40, 107, 192, 211, 298], [2, 88]), { 12: $V7, 15: $V8, 27: $VG, 28: $VH, 52: 145, 79: $VI, 88: 146, 163: $VJ, 172: 222, 174: 223, 183: 463, 210: $VK, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($V01, [2, 9]), o($Vi1, [2, 128]), o($Vj1, [2, 130]), o($Vj1, [2, 133]), o($Vk1, [2, 135]), o($Vk1, [2, 136], { 238: 336, 237: 464, 287: $VQ1, 302: $VR1 }), o($Vk1, [2, 137], { 238: 336, 237: 465, 287: $VQ1, 302: $VR1 }), o($Vl1, [2, 139]), o($VP1, [2, 329], { 165: 466 }), o($VP1, [2, 328]), o([6, 12, 15, 27, 28, 30, 31, 38, 40, 70, 73, 75, 78, 79, 80, 82, 107, 155, 156, 158, 161, 162, 163, 192, 210, 213, 214, 218, 222, 226, 241, 243, 244, 245, 246, 247, 249, 250, 252, 253, 256, 258, 263, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 287, 298, 302, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316], [2, 149]), { 31: [1, 467] }, { 246: [1, 468] }, { 246: [1, 469] }, o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 470, 203: $V31, 241: $V41, 305: $V51 }), { 31: [1, 471] }, { 31: [1, 472] }, o($VU1, [2, 159]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 255: 473, 29: 475, 203: $V31, 241: $V41, 287: [1, 474], 305: $V51 }), o($Va2, [2, 410]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 476, 203: $V31, 241: $V41, 305: $V51 }), o($VP1, [2, 414]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 477, 203: $V31, 241: $V41, 305: $V51 }), o($VP1, [2, 416]), o($Vt, [2, 35]), o($VZ1, [2, 252]), o($Vj2, [2, 253], { 91: 478 }), o($Vn, $Vz, { 140: 122, 136: 479, 139: 480, 40: [2, 297] }), o($VB, [2, 52]), o($V$1, [2, 29], { 80: [1, 481] }), o($V$1, [2, 30], { 78: [1, 482] }), o($VG1, [2, 24], { 242: 250, 248: 255, 251: 258, 74: 293, 64: 294, 65: 295, 52: 296, 76: 438, 72: 483, 12: $V7, 15: $V8, 27: $Vb2, 28: $Vn1, 73: $Vc2, 75: $Vd2, 243: $Vo1, 244: $Vp1, 245: $Vq1, 247: $Vr1, 249: $Vs1, 250: $Vt1, 252: $Vu1, 253: $Vv1, 256: $Vw1, 258: $Vx1, 281: $Va, 311: $Vy1, 312: $Vz1, 313: $VA1, 314: $VB1, 315: $VC1, 316: $VD1 }), o($Vk2, [2, 245]), { 28: $Vn1, 74: 484 }, { 28: $Vn1, 74: 485 }, o($Vk2, [2, 27]), o($Vk2, [2, 28]), o($V22, [2, 20]), { 27: [1, 486] }, { 40: [2, 6] }, { 40: [2, 202] }, o($Vn, $Va1, { 151: 208, 149: 487, 150: 488, 38: $Vl2, 40: $Vl2, 82: $Vl2, 107: $Vl2, 155: $Vl2, 156: $Vl2, 158: $Vl2, 161: $Vl2, 162: $Vl2 }), o($Ve2, [2, 312]), o($Vg2, [2, 67], { 299: [1, 489] }), o($Vg2, [2, 68]), o($Vg2, [2, 69]), { 38: $VF, 54: 490 }, { 38: [2, 321] }, { 38: [2, 322] }, { 12: $V7, 15: $V8, 27: [1, 492], 52: 493, 160: 491, 281: $Va }, o($Vf2, [2, 324]), o($Vg2, [2, 72]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 494, 203: $V31, 241: $V41, 305: $V51 }), { 12: $V7, 15: $V8, 27: $VG, 28: $VK1, 52: 145, 79: $VI, 88: 146, 163: $VJ, 172: 395, 185: 396, 189: 495, 210: $VL1, 213: $VL, 214: $VM, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, o($VN1, [2, 98], { 301: [1, 496] }), o($Vm2, [2, 366], { 198: 497, 202: 498, 208: [1, 499] }), o($Vf1, [2, 115]), o($VN1, [2, 375]), o($Vf1, [2, 116]), o($Vi2, [2, 342]), o($Vn2, [2, 92], { 246: [1, 500] }), o($Vl1, [2, 393]), o($Vl1, [2, 395]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 501, 203: $V31, 241: $V41, 305: $V51 }), o($VU1, [2, 152]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 502, 203: $V31, 241: $V41, 305: $V51 }), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 503, 203: $V31, 241: $V41, 305: $V51 }), { 31: [1, 504], 246: [1, 505] }, o($VU1, [2, 156]), o($VU1, [2, 158]), { 31: [1, 506] }, { 31: [2, 411] }, { 31: [2, 412] }, { 31: [1, 507] }, { 31: [2, 417], 192: [1, 510], 260: 508, 261: 509 }, { 12: $V7, 15: $V8, 31: [1, 511], 52: 272, 79: $VI, 87: 512, 88: 273, 89: $VE1, 231: 156, 233: 157, 264: 152, 267: $VN, 268: $VO, 269: $VP, 270: $VQ, 271: $VR, 272: $VS, 273: $VT, 274: $VU, 275: $VV, 276: $VW, 277: $VX, 278: $VY, 279: $VZ, 280: $V_, 281: $Va }, { 40: [1, 513] }, { 40: [2, 298] }, { 79: [1, 514] }, { 79: [1, 515] }, o($Vk2, [2, 246]), o($Vk2, [2, 25]), o($Vk2, [2, 26]), { 31: [1, 516] }, o($VJ1, [2, 65]), o($VJ1, [2, 314]), { 38: [2, 320] }, o($Vg2, [2, 70]), { 38: $VF, 54: 517 }, { 38: [2, 325] }, { 38: [2, 326] }, { 30: [1, 518] }, o($Vn2, [2, 353], { 190: 519, 246: [1, 520] }), o($V42, [2, 358]), o([12, 15, 27, 28, 31, 79, 163, 210, 213, 214, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 301], [2, 99], { 302: [1, 521] }), { 12: $V7, 15: $V8, 28: [1, 527], 52: 524, 181: [1, 525], 199: 522, 200: 523, 203: [1, 526], 281: $Va }, o($Vm2, [2, 367]), o($Vn, [2, 346]), { 31: [1, 528], 246: [1, 529] }, { 31: [1, 530] }, { 246: [1, 531] }, o($VU1, [2, 81]), o($VP1, [2, 332]), o($VU1, [2, 160]), o($VU1, [2, 161]), { 31: [1, 532] }, { 31: [2, 418] }, { 262: [1, 533] }, o($VZ1, [2, 39]), o($Vj2, [2, 254]), o($Vo2, [2, 299], { 137: 534, 298: [1, 535] }), o($V$1, [2, 31]), o($V$1, [2, 32]), o($V22, [2, 21]), o($Vg2, [2, 71]), { 27: [1, 536] }, o([38, 40, 82, 107, 155, 156, 158, 161, 162, 211, 298], [2, 95], { 191: 537, 192: [1, 538] }), o($Vn, [2, 352]), o($V42, [2, 360]), o($Vp2, [2, 101]), o($Vp2, [2, 364], { 201: 539, 303: 540, 287: [1, 542], 304: [1, 541], 305: [1, 543] }), o($Vq2, [2, 102]), o($Vq2, [2, 103]), { 12: $V7, 15: $V8, 28: [1, 547], 52: 548, 163: [1, 546], 181: $Vr2, 204: 544, 205: 545, 208: $Vs2, 281: $Va }, o($V42, $V52, { 195: 390, 194: 551 }), o($VU1, [2, 79]), o($VP1, [2, 330]), o($VU1, [2, 153]), o($V11, $V21, { 215: 176, 219: 177, 223: 178, 227: 179, 235: 180, 239: 181, 29: 552, 203: $V31, 241: $V41, 305: $V51 }), o($VU1, [2, 162]), { 263: [1, 553] }, o($Vn, $Vz, { 140: 122, 138: 554, 139: 555, 40: $Vt2, 107: $Vt2 }), o($Vo2, [2, 300]), { 31: [1, 556] }, o($Vn2, [2, 354]), o($Vn2, [2, 96], { 195: 390, 193: 557, 194: 558, 12: $V52, 15: $V52, 28: $V52, 181: $V52, 203: $V52, 208: $V52, 281: $V52, 27: [1, 559] }), o($Vp2, [2, 100]), o($Vp2, [2, 365]), o($Vp2, [2, 361]), o($Vp2, [2, 362]), o($Vp2, [2, 363]), o($Vq2, [2, 104]), o($Vq2, [2, 106]), o($Vq2, [2, 107]), o($Vu2, [2, 368], { 206: 560 }), o($Vq2, [2, 109]), o($Vq2, [2, 110]), { 12: $V7, 15: $V8, 52: 561, 181: [1, 562], 281: $Va }, { 31: [1, 563] }, { 31: [1, 564] }, { 264: 565, 271: $VR, 272: $VS, 273: $VT, 274: $VU }, o($V81, [2, 60]), o($V81, [2, 302]), o($Vg2, [2, 73]), o($Vn, $V82, { 182: 402, 180: 566 }), o($Vn, [2, 355]), o($Vn, [2, 356]), { 12: $V7, 15: $V8, 31: [2, 370], 52: 548, 181: $Vr2, 205: 568, 207: 567, 208: $Vs2, 281: $Va }, o($Vq2, [2, 111]), o($Vq2, [2, 112]), o($Vq2, [2, 105]), o($VU1, [2, 154]), { 31: [2, 163] }, o($Vn2, [2, 97]), { 31: [1, 569] }, { 31: [2, 371], 301: [1, 570] }, o($Vq2, [2, 108]), o($Vu2, [2, 369])],
	        defaultActions: { 5: [2, 191], 6: [2, 192], 22: [2, 1], 23: [2, 2], 24: [2, 198], 74: [2, 271], 89: [2, 232], 94: [2, 334], 212: [2, 216], 213: [2, 83], 239: [2, 387], 267: [2, 408], 359: [2, 295], 360: [2, 296], 442: [2, 6], 443: [2, 202], 450: [2, 321], 451: [2, 322], 474: [2, 411], 475: [2, 412], 480: [2, 298], 489: [2, 320], 492: [2, 325], 493: [2, 326], 509: [2, 418], 565: [2, 163] },
	        parseError: function parseError(str, hash) {
	            if (hash.recoverable) {
	                this.trace(str);
	            } else {
	                var _parseError = function _parseError(msg, hash) {
	                    this.message = msg;
	                    this.hash = hash;
	                };

	                _parseError.prototype = new Error();

	                throw new _parseError(str, hash);
	            }
	        },
	        parse: function parse(input) {
	            var self = this,
	                stack = [0],
	                tstack = [],
	                vstack = [null],
	                lstack = [],
	                table = this.table,
	                yytext = '',
	                yylineno = 0,
	                yyleng = 0,
	                recovering = 0,
	                TERROR = 2,
	                EOF = 1;
	            var args = lstack.slice.call(arguments, 1);
	            var lexer = Object.create(this.lexer);
	            var sharedState = { yy: {} };
	            for (var k in this.yy) {
	                if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
	                    sharedState.yy[k] = this.yy[k];
	                }
	            }
	            lexer.setInput(input, sharedState.yy);
	            sharedState.yy.lexer = lexer;
	            sharedState.yy.parser = this;
	            if (typeof lexer.yylloc == 'undefined') {
	                lexer.yylloc = {};
	            }
	            var yyloc = lexer.yylloc;
	            lstack.push(yyloc);
	            var ranges = lexer.options && lexer.options.ranges;
	            if (typeof sharedState.yy.parseError === 'function') {
	                this.parseError = sharedState.yy.parseError;
	            } else {
	                this.parseError = Object.getPrototypeOf(this).parseError;
	            }
	            function popStack(n) {
	                stack.length = stack.length - 2 * n;
	                vstack.length = vstack.length - n;
	                lstack.length = lstack.length - n;
	            }
	            _token_stack: var lex = function lex() {
	                var token;
	                token = lexer.lex() || EOF;
	                if (typeof token !== 'number') {
	                    token = self.symbols_[token] || token;
	                }
	                return token;
	            };
	            var symbol,
	                preErrorSymbol,
	                state,
	                action,
	                a,
	                r,
	                yyval = {},
	                p,
	                len,
	                newState,
	                expected;
	            while (true) {
	                state = stack[stack.length - 1];
	                if (this.defaultActions[state]) {
	                    action = this.defaultActions[state];
	                } else {
	                    if (symbol === null || typeof symbol == 'undefined') {
	                        symbol = lex();
	                    }
	                    action = table[state] && table[state][symbol];
	                }
	                if (typeof action === 'undefined' || !action.length || !action[0]) {
	                    var errStr = '';
	                    expected = [];
	                    for (p in table[state]) {
	                        if (this.terminals_[p] && p > TERROR) {
	                            expected.push('\'' + this.terminals_[p] + '\'');
	                        }
	                    }
	                    if (lexer.showPosition) {
	                        errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
	                    } else {
	                        errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
	                    }
	                    this.parseError(errStr, {
	                        text: lexer.match,
	                        token: this.terminals_[symbol] || symbol,
	                        line: lexer.yylineno,
	                        loc: yyloc,
	                        expected: expected
	                    });
	                }
	                if (action[0] instanceof Array && action.length > 1) {
	                    throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
	                }
	                switch (action[0]) {
	                    case 1:
	                        stack.push(symbol);
	                        vstack.push(lexer.yytext);
	                        lstack.push(lexer.yylloc);
	                        stack.push(action[1]);
	                        symbol = null;
	                        if (!preErrorSymbol) {
	                            yyleng = lexer.yyleng;
	                            yytext = lexer.yytext;
	                            yylineno = lexer.yylineno;
	                            yyloc = lexer.yylloc;
	                            if (recovering > 0) {
	                                recovering--;
	                            }
	                        } else {
	                            symbol = preErrorSymbol;
	                            preErrorSymbol = null;
	                        }
	                        break;
	                    case 2:
	                        len = this.productions_[action[1]][1];
	                        yyval.$ = vstack[vstack.length - len];
	                        yyval._$ = {
	                            first_line: lstack[lstack.length - (len || 1)].first_line,
	                            last_line: lstack[lstack.length - 1].last_line,
	                            first_column: lstack[lstack.length - (len || 1)].first_column,
	                            last_column: lstack[lstack.length - 1].last_column
	                        };
	                        if (ranges) {
	                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
	                        }
	                        r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));
	                        if (typeof r !== 'undefined') {
	                            return r;
	                        }
	                        if (len) {
	                            stack = stack.slice(0, -1 * len * 2);
	                            vstack = vstack.slice(0, -1 * len);
	                            lstack = lstack.slice(0, -1 * len);
	                        }
	                        stack.push(this.productions_[action[1]][0]);
	                        vstack.push(yyval.$);
	                        lstack.push(yyval._$);
	                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
	                        stack.push(newState);
	                        break;
	                    case 3:
	                        return true;
	                }
	            }
	            return true;
	        } };

	    /** @license SPARQL.js ©2014-2016 Ruben Verborgh, released under the MIT Licence */
	    /*
	      SPARQL parser in the Jison parser generator format.
	    */

	    // Common namespaces and entities
	    var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	        RDF_TYPE = RDF + 'type',
	        RDF_FIRST = RDF + 'first',
	        RDF_REST = RDF + 'rest',
	        RDF_NIL = RDF + 'nil',
	        XSD = 'http://www.w3.org/2001/XMLSchema#',
	        XSD_INTEGER = XSD + 'integer',
	        XSD_DECIMAL = XSD + 'decimal',
	        XSD_DOUBLE = XSD + 'double',
	        XSD_BOOLEAN = XSD + 'boolean',
	        XSD_TRUE = '"true"^^' + XSD_BOOLEAN,
	        XSD_FALSE = '"false"^^' + XSD_BOOLEAN;

	    var base = '',
	        basePath = '',
	        baseRoot = '';

	    // Returns a lowercase version of the given string
	    function lowercase(string) {
	        return string.toLowerCase();
	    }

	    // Appends the item to the array and returns the array
	    function appendTo(array, item) {
	        return array.push(item), array;
	    }

	    // Appends the items to the array and returns the array
	    function appendAllTo(array, items) {
	        return array.push.apply(array, items), array;
	    }

	    // Extends a base object with properties of other objects
	    function extend(base) {
	        if (!base) base = {};
	        for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++) {
	            for (var name in arg) {
	                base[name] = arg[name];
	            }
	        }return base;
	    }

	    // Creates an array that contains all items of the given arrays
	    function unionAll() {
	        var union = [];
	        for (var i = 0, l = arguments.length; i < l; i++) {
	            union = union.concat.apply(union, arguments[i]);
	        }return union;
	    }

	    // Resolves an IRI against a base path
	    function resolveIRI(iri) {
	        // Strip off possible angular brackets
	        if (iri[0] === '<') iri = iri.substring(1, iri.length - 1);
	        // Return absolute IRIs unmodified
	        if (/^[a-z]+:/.test(iri)) return iri;
	        if (!Parser.base) throw new Error('Cannot resolve relative IRI ' + iri + ' because no base IRI was set.');
	        if (!base) {
	            base = Parser.base;
	            basePath = base.replace(/[^\/:]*$/, '');
	            baseRoot = base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
	        }
	        switch (iri[0]) {
	            // An empty relative IRI indicates the base IRI
	            case undefined:
	                return base;
	            // Resolve relative fragment IRIs against the base IRI
	            case '#':
	                return base + iri;
	            // Resolve relative query string IRIs by replacing the query string
	            case '?':
	                return base.replace(/(?:\?.*)?$/, iri);
	            // Resolve root relative IRIs at the root of the base IRI
	            case '/':
	                return baseRoot + iri;
	            // Resolve all other IRIs at the base IRI's path
	            default:
	                return basePath + iri;
	        }
	    }

	    // If the item is a variable, ensures it starts with a question mark
	    function toVar(variable) {
	        if (variable) {
	            var first = variable[0];
	            if (first === '?') return variable;
	            if (first === '$') return '?' + variable.substr(1);
	        }
	        return variable;
	    }

	    // Creates an operation with the given name and arguments
	    function operation(operatorName, args) {
	        return { type: 'operation', operator: operatorName, args: args || [] };
	    }

	    // Creates an expression with the given type and attributes
	    function expression(expr, attr) {
	        var expression = { expression: expr };
	        if (attr) for (var a in attr) {
	            expression[a] = attr[a];
	        }return expression;
	    }

	    // Creates a path with the given type and items
	    function path(type, items) {
	        return { type: 'path', pathType: type, items: items };
	    }

	    // Transforms a list of operations types and arguments into a tree of operations
	    function createOperationTree(initialExpression, operationList) {
	        for (var i = 0, l = operationList.length, item; i < l && (item = operationList[i]); i++) {
	            initialExpression = operation(item[0], [initialExpression, item[1]]);
	        }return initialExpression;
	    }

	    // Group datasets by default and named
	    function groupDatasets(fromClauses) {
	        var defaults = [],
	            named = [],
	            l = fromClauses.length,
	            fromClause;
	        for (var i = 0; i < l && (fromClause = fromClauses[i]); i++) {
	            (fromClause.named ? named : defaults).push(fromClause.iri);
	        }return l ? { from: { default: defaults, named: named } } : null;
	    }

	    // Converts the number to a string
	    function toInt(string) {
	        return parseInt(string, 10);
	    }

	    // Transforms a possibly single group into its patterns
	    function degroupSingle(group) {
	        return group.type === 'group' && group.patterns.length === 1 ? group.patterns[0] : group;
	    }

	    // Creates a literal with the given value and type
	    function createLiteral(value, type) {
	        return '"' + value + '"^^' + type;
	    }

	    // Creates a triple with the given subject, predicate, and object
	    function triple(subject, predicate, object) {
	        var triple = {};
	        if (subject != null) triple.subject = subject;
	        if (predicate != null) triple.predicate = predicate;
	        if (object != null) triple.object = object;
	        return triple;
	    }

	    // Creates a new blank node identifier
	    function blank() {
	        return '_:b' + blankId++;
	    };
	    var blankId = 0;
	    Parser._resetBlanks = function () {
	        blankId = 0;
	    };

	    // Regular expression and replacement strings to escape strings
	    var escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g,
	        escapeReplacements = { '\\': '\\', "'": "'", '"': '"',
	        't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
	        fromCharCode = String.fromCharCode;

	    // Translates escape codes in the string into their textual equivalent
	    function unescapeString(string, trimLength) {
	        string = string.substring(trimLength, string.length - trimLength);
	        try {
	            string = string.replace(escapeSequence, function (sequence, unicode4, unicode8, escapedChar) {
	                var charCode;
	                if (unicode4) {
	                    charCode = parseInt(unicode4, 16);
	                    if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
	                    return fromCharCode(charCode);
	                } else if (unicode8) {
	                    charCode = parseInt(unicode8, 16);
	                    if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
	                    if (charCode < 0xFFFF) return fromCharCode(charCode);
	                    return fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
	                } else {
	                    var replacement = escapeReplacements[escapedChar];
	                    if (!replacement) throw new Error();
	                    return replacement;
	                }
	            });
	        } catch (error) {
	            return '';
	        }
	        return '"' + string + '"';
	    }

	    // Creates a list, collecting its (possibly blank) items and triples associated with those items
	    function createList(objects) {
	        var list = blank(),
	            head = list,
	            listItems = [],
	            listTriples,
	            triples = [];
	        objects.forEach(function (o) {
	            listItems.push(o.entity);appendAllTo(triples, o.triples);
	        });

	        // Build an RDF list out of the items
	        for (var i = 0, j = 0, l = listItems.length, listTriples = Array(l * 2); i < l;) {
	            listTriples[j++] = triple(head, RDF_FIRST, listItems[i]), listTriples[j++] = triple(head, RDF_REST, head = ++i < l ? blank() : RDF_NIL);
	        } // Return the list's identifier, its triples, and the triples associated with its items
	        return { entity: list, triples: appendAllTo(listTriples, triples) };
	    }

	    // Creates a blank node identifier, collecting triples with that blank node as subject
	    function createAnonymousObject(propertyList) {
	        var entity = blank();
	        return {
	            entity: entity,
	            triples: propertyList.map(function (t) {
	                return extend(triple(entity), t);
	            })
	        };
	    }

	    // Collects all (possibly blank) objects, and triples that have them as subject
	    function objectListToTriples(predicate, objectList, otherTriples) {
	        var objects = [],
	            triples = [];
	        objectList.forEach(function (l) {
	            objects.push(triple(null, predicate, l.entity));
	            appendAllTo(triples, l.triples);
	        });
	        return unionAll(objects, otherTriples || [], triples);
	    }
	    /* generated by jison-lex 0.3.4 */
	    var lexer = function () {
	        var lexer = {

	            EOF: 1,

	            parseError: function parseError(str, hash) {
	                if (this.yy.parser) {
	                    this.yy.parser.parseError(str, hash);
	                } else {
	                    throw new Error(str);
	                }
	            },

	            // resets the lexer, sets new input
	            setInput: function setInput(input, yy) {
	                this.yy = yy || this.yy || {};
	                this._input = input;
	                this._more = this._backtrack = this.done = false;
	                this.yylineno = this.yyleng = 0;
	                this.yytext = this.matched = this.match = '';
	                this.conditionStack = ['INITIAL'];
	                this.yylloc = {
	                    first_line: 1,
	                    first_column: 0,
	                    last_line: 1,
	                    last_column: 0
	                };
	                if (this.options.ranges) {
	                    this.yylloc.range = [0, 0];
	                }
	                this.offset = 0;
	                return this;
	            },

	            // consumes and returns one char from the input
	            input: function input() {
	                var ch = this._input[0];
	                this.yytext += ch;
	                this.yyleng++;
	                this.offset++;
	                this.match += ch;
	                this.matched += ch;
	                var lines = ch.match(/(?:\r\n?|\n).*/g);
	                if (lines) {
	                    this.yylineno++;
	                    this.yylloc.last_line++;
	                } else {
	                    this.yylloc.last_column++;
	                }
	                if (this.options.ranges) {
	                    this.yylloc.range[1]++;
	                }

	                this._input = this._input.slice(1);
	                return ch;
	            },

	            // unshifts one char (or a string) into the input
	            unput: function unput(ch) {
	                var len = ch.length;
	                var lines = ch.split(/(?:\r\n?|\n)/g);

	                this._input = ch + this._input;
	                this.yytext = this.yytext.substr(0, this.yytext.length - len);
	                //this.yyleng -= len;
	                this.offset -= len;
	                var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	                this.match = this.match.substr(0, this.match.length - 1);
	                this.matched = this.matched.substr(0, this.matched.length - 1);

	                if (lines.length - 1) {
	                    this.yylineno -= lines.length - 1;
	                }
	                var r = this.yylloc.range;

	                this.yylloc = {
	                    first_line: this.yylloc.first_line,
	                    last_line: this.yylineno + 1,
	                    first_column: this.yylloc.first_column,
	                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
	                };

	                if (this.options.ranges) {
	                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	                }
	                this.yyleng = this.yytext.length;
	                return this;
	            },

	            // When called from action, caches matched text and appends it on next action
	            more: function more() {
	                this._more = true;
	                return this;
	            },

	            // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
	            reject: function reject() {
	                if (this.options.backtrack_lexer) {
	                    this._backtrack = true;
	                } else {
	                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
	                        text: "",
	                        token: null,
	                        line: this.yylineno
	                    });
	                }
	                return this;
	            },

	            // retain first n characters of the match
	            less: function less(n) {
	                this.unput(this.match.slice(n));
	            },

	            // displays already matched input, i.e. for error messages
	            pastInput: function pastInput() {
	                var past = this.matched.substr(0, this.matched.length - this.match.length);
	                return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
	            },

	            // displays upcoming input, i.e. for error messages
	            upcomingInput: function upcomingInput() {
	                var next = this.match;
	                if (next.length < 20) {
	                    next += this._input.substr(0, 20 - next.length);
	                }
	                return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
	            },

	            // displays the character position where the lexing error occurred, i.e. for error messages
	            showPosition: function showPosition() {
	                var pre = this.pastInput();
	                var c = new Array(pre.length + 1).join("-");
	                return pre + this.upcomingInput() + "\n" + c + "^";
	            },

	            // test the lexed token: return FALSE when not a match, otherwise return token
	            test_match: function test_match(match, indexed_rule) {
	                var token, lines, backup;

	                if (this.options.backtrack_lexer) {
	                    // save context
	                    backup = {
	                        yylineno: this.yylineno,
	                        yylloc: {
	                            first_line: this.yylloc.first_line,
	                            last_line: this.last_line,
	                            first_column: this.yylloc.first_column,
	                            last_column: this.yylloc.last_column
	                        },
	                        yytext: this.yytext,
	                        match: this.match,
	                        matches: this.matches,
	                        matched: this.matched,
	                        yyleng: this.yyleng,
	                        offset: this.offset,
	                        _more: this._more,
	                        _input: this._input,
	                        yy: this.yy,
	                        conditionStack: this.conditionStack.slice(0),
	                        done: this.done
	                    };
	                    if (this.options.ranges) {
	                        backup.yylloc.range = this.yylloc.range.slice(0);
	                    }
	                }

	                lines = match[0].match(/(?:\r\n?|\n).*/g);
	                if (lines) {
	                    this.yylineno += lines.length;
	                }
	                this.yylloc = {
	                    first_line: this.yylloc.last_line,
	                    last_line: this.yylineno + 1,
	                    first_column: this.yylloc.last_column,
	                    last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
	                };
	                this.yytext += match[0];
	                this.match += match[0];
	                this.matches = match;
	                this.yyleng = this.yytext.length;
	                if (this.options.ranges) {
	                    this.yylloc.range = [this.offset, this.offset += this.yyleng];
	                }
	                this._more = false;
	                this._backtrack = false;
	                this._input = this._input.slice(match[0].length);
	                this.matched += match[0];
	                token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
	                if (this.done && this._input) {
	                    this.done = false;
	                }
	                if (token) {
	                    return token;
	                } else if (this._backtrack) {
	                    // recover context
	                    for (var k in backup) {
	                        this[k] = backup[k];
	                    }
	                    return false; // rule action called reject() implying the next rule should be tested instead.
	                }
	                return false;
	            },

	            // return next match in input
	            next: function next() {
	                if (this.done) {
	                    return this.EOF;
	                }
	                if (!this._input) {
	                    this.done = true;
	                }

	                var token, match, tempMatch, index;
	                if (!this._more) {
	                    this.yytext = '';
	                    this.match = '';
	                }
	                var rules = this._currentRules();
	                for (var i = 0; i < rules.length; i++) {
	                    tempMatch = this._input.match(this.rules[rules[i]]);
	                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                        match = tempMatch;
	                        index = i;
	                        if (this.options.backtrack_lexer) {
	                            token = this.test_match(tempMatch, rules[i]);
	                            if (token !== false) {
	                                return token;
	                            } else if (this._backtrack) {
	                                match = false;
	                                continue; // rule action called reject() implying a rule MISmatch.
	                            } else {
	                                // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
	                                return false;
	                            }
	                        } else if (!this.options.flex) {
	                            break;
	                        }
	                    }
	                }
	                if (match) {
	                    token = this.test_match(match, rules[index]);
	                    if (token !== false) {
	                        return token;
	                    }
	                    // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
	                    return false;
	                }
	                if (this._input === "") {
	                    return this.EOF;
	                } else {
	                    return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
	                        text: "",
	                        token: null,
	                        line: this.yylineno
	                    });
	                }
	            },

	            // return next match that has a token
	            lex: function lex() {
	                var r = this.next();
	                if (r) {
	                    return r;
	                } else {
	                    return this.lex();
	                }
	            },

	            // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
	            begin: function begin(condition) {
	                this.conditionStack.push(condition);
	            },

	            // pop the previously active lexer condition state off the condition stack
	            popState: function popState() {
	                var n = this.conditionStack.length - 1;
	                if (n > 0) {
	                    return this.conditionStack.pop();
	                } else {
	                    return this.conditionStack[0];
	                }
	            },

	            // produce the lexer rule set which is active for the currently active lexer condition state
	            _currentRules: function _currentRules() {
	                if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
	                    return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
	                } else {
	                    return this.conditions["INITIAL"].rules;
	                }
	            },

	            // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
	            topState: function topState(n) {
	                n = this.conditionStack.length - 1 - Math.abs(n || 0);
	                if (n >= 0) {
	                    return this.conditionStack[n];
	                } else {
	                    return "INITIAL";
	                }
	            },

	            // alias for begin(condition)
	            pushState: function pushState(condition) {
	                this.begin(condition);
	            },

	            // return the number of states currently on the stack
	            stateStackSize: function stateStackSize() {
	                return this.conditionStack.length;
	            },
	            options: { "flex": true, "case-insensitive": true },
	            performAction: function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
	                var YYSTATE = YY_START;
	                switch ($avoiding_name_collisions) {
	                    case 0:
	                        /* ignore */
	                        break;
	                    case 1:
	                        return 11;
	                        break;
	                    case 2:
	                        return 14;
	                        break;
	                    case 3:
	                        return 23;
	                        break;
	                    case 4:
	                        return 284;
	                        break;
	                    case 5:
	                        return 285;
	                        break;
	                    case 6:
	                        return 28;
	                        break;
	                    case 7:
	                        return 30;
	                        break;
	                    case 8:
	                        return 31;
	                        break;
	                    case 9:
	                        return 287;
	                        break;
	                    case 10:
	                        return 33;
	                        break;
	                    case 11:
	                        return 37;
	                        break;
	                    case 12:
	                        return 38;
	                        break;
	                    case 13:
	                        return 40;
	                        break;
	                    case 14:
	                        return 42;
	                        break;
	                    case 15:
	                        return 47;
	                        break;
	                    case 16:
	                        return 50;
	                        break;
	                    case 17:
	                        return 290;
	                        break;
	                    case 18:
	                        return 60;
	                        break;
	                    case 19:
	                        return 61;
	                        break;
	                    case 20:
	                        return 67;
	                        break;
	                    case 21:
	                        return 70;
	                        break;
	                    case 22:
	                        return 73;
	                        break;
	                    case 23:
	                        return 75;
	                        break;
	                    case 24:
	                        return 78;
	                        break;
	                    case 25:
	                        return 80;
	                        break;
	                    case 26:
	                        return 82;
	                        break;
	                    case 27:
	                        return 192;
	                        break;
	                    case 28:
	                        return 95;
	                        break;
	                    case 29:
	                        return 291;
	                        break;
	                    case 30:
	                        return 128;
	                        break;
	                    case 31:
	                        return 292;
	                        break;
	                    case 32:
	                        return 293;
	                        break;
	                    case 33:
	                        return 105;
	                        break;
	                    case 34:
	                        return 294;
	                        break;
	                    case 35:
	                        return 104;
	                        break;
	                    case 36:
	                        return 295;
	                        break;
	                    case 37:
	                        return 296;
	                        break;
	                    case 38:
	                        return 108;
	                        break;
	                    case 39:
	                        return 110;
	                        break;
	                    case 40:
	                        return 111;
	                        break;
	                    case 41:
	                        return 126;
	                        break;
	                    case 42:
	                        return 120;
	                        break;
	                    case 43:
	                        return 121;
	                        break;
	                    case 44:
	                        return 123;
	                        break;
	                    case 45:
	                        return 129;
	                        break;
	                    case 46:
	                        return 107;
	                        break;
	                    case 47:
	                        return 297;
	                        break;
	                    case 48:
	                        return 298;
	                        break;
	                    case 49:
	                        return 155;
	                        break;
	                    case 50:
	                        return 158;
	                        break;
	                    case 51:
	                        return 162;
	                        break;
	                    case 52:
	                        return 89;
	                        break;
	                    case 53:
	                        return 156;
	                        break;
	                    case 54:
	                        return 299;
	                        break;
	                    case 55:
	                        return 161;
	                        break;
	                    case 56:
	                        return 246;
	                        break;
	                    case 57:
	                        return 181;
	                        break;
	                    case 58:
	                        return 301;
	                        break;
	                    case 59:
	                        return 302;
	                        break;
	                    case 60:
	                        return 208;
	                        break;
	                    case 61:
	                        return 304;
	                        break;
	                    case 62:
	                        return 305;
	                        break;
	                    case 63:
	                        return 203;
	                        break;
	                    case 64:
	                        return 210;
	                        break;
	                    case 65:
	                        return 211;
	                        break;
	                    case 66:
	                        return 218;
	                        break;
	                    case 67:
	                        return 222;
	                        break;
	                    case 68:
	                        return 263;
	                        break;
	                    case 69:
	                        return 306;
	                        break;
	                    case 70:
	                        return 307;
	                        break;
	                    case 71:
	                        return 308;
	                        break;
	                    case 72:
	                        return 309;
	                        break;
	                    case 73:
	                        return 310;
	                        break;
	                    case 74:
	                        return 226;
	                        break;
	                    case 75:
	                        return 311;
	                        break;
	                    case 76:
	                        return 241;
	                        break;
	                    case 77:
	                        return 249;
	                        break;
	                    case 78:
	                        return 250;
	                        break;
	                    case 79:
	                        return 243;
	                        break;
	                    case 80:
	                        return 244;
	                        break;
	                    case 81:
	                        return 245;
	                        break;
	                    case 82:
	                        return 312;
	                        break;
	                    case 83:
	                        return 313;
	                        break;
	                    case 84:
	                        return 247;
	                        break;
	                    case 85:
	                        return 315;
	                        break;
	                    case 86:
	                        return 314;
	                        break;
	                    case 87:
	                        return 316;
	                        break;
	                    case 88:
	                        return 252;
	                        break;
	                    case 89:
	                        return 253;
	                        break;
	                    case 90:
	                        return 256;
	                        break;
	                    case 91:
	                        return 258;
	                        break;
	                    case 92:
	                        return 262;
	                        break;
	                    case 93:
	                        return 266;
	                        break;
	                    case 94:
	                        return 269;
	                        break;
	                    case 95:
	                        return 270;
	                        break;
	                    case 96:
	                        return 12;
	                        break;
	                    case 97:
	                        return 15;
	                        break;
	                    case 98:
	                        return 281;
	                        break;
	                    case 99:
	                        return 213;
	                        break;
	                    case 100:
	                        return 27;
	                        break;
	                    case 101:
	                        return 265;
	                        break;
	                    case 102:
	                        return 79;
	                        break;
	                    case 103:
	                        return 267;
	                        break;
	                    case 104:
	                        return 268;
	                        break;
	                    case 105:
	                        return 275;
	                        break;
	                    case 106:
	                        return 276;
	                        break;
	                    case 107:
	                        return 277;
	                        break;
	                    case 108:
	                        return 278;
	                        break;
	                    case 109:
	                        return 279;
	                        break;
	                    case 110:
	                        return 280;
	                        break;
	                    case 111:
	                        return 'EXPONENT';
	                        break;
	                    case 112:
	                        return 271;
	                        break;
	                    case 113:
	                        return 272;
	                        break;
	                    case 114:
	                        return 273;
	                        break;
	                    case 115:
	                        return 274;
	                        break;
	                    case 116:
	                        return 163;
	                        break;
	                    case 117:
	                        return 214;
	                        break;
	                    case 118:
	                        return 6;
	                        break;
	                    case 119:
	                        return 'INVALID';
	                        break;
	                    case 120:
	                        console.log(yy_.yytext);
	                        break;
	                }
	            },
	            rules: [/^(?:\s+|#[^\n\r]*)/i, /^(?:BASE)/i, /^(?:PREFIX)/i, /^(?:SELECT)/i, /^(?:DISTINCT)/i, /^(?:REDUCED)/i, /^(?:\()/i, /^(?:AS)/i, /^(?:\))/i, /^(?:\*)/i, /^(?:CONSTRUCT)/i, /^(?:WHERE)/i, /^(?:\{)/i, /^(?:\})/i, /^(?:DESCRIBE)/i, /^(?:ASK)/i, /^(?:FROM)/i, /^(?:NAMED)/i, /^(?:GROUP)/i, /^(?:BY)/i, /^(?:HAVING)/i, /^(?:ORDER)/i, /^(?:ASC)/i, /^(?:DESC)/i, /^(?:LIMIT)/i, /^(?:OFFSET)/i, /^(?:VALUES)/i, /^(?:;)/i, /^(?:LOAD)/i, /^(?:SILENT)/i, /^(?:INTO)/i, /^(?:CLEAR)/i, /^(?:DROP)/i, /^(?:CREATE)/i, /^(?:ADD)/i, /^(?:TO)/i, /^(?:MOVE)/i, /^(?:COPY)/i, /^(?:INSERT\s+DATA)/i, /^(?:DELETE\s+DATA)/i, /^(?:DELETE\s+WHERE)/i, /^(?:WITH)/i, /^(?:DELETE)/i, /^(?:INSERT)/i, /^(?:USING)/i, /^(?:DEFAULT)/i, /^(?:GRAPH)/i, /^(?:ALL)/i, /^(?:\.)/i, /^(?:OPTIONAL)/i, /^(?:SERVICE)/i, /^(?:BIND)/i, /^(?:UNDEF)/i, /^(?:MINUS)/i, /^(?:UNION)/i, /^(?:FILTER)/i, /^(?:,)/i, /^(?:a)/i, /^(?:\|)/i, /^(?:\/)/i, /^(?:\^)/i, /^(?:\?)/i, /^(?:\+)/i, /^(?:!)/i, /^(?:\[)/i, /^(?:\])/i, /^(?:\|\|)/i, /^(?:&&)/i, /^(?:=)/i, /^(?:!=)/i, /^(?:<)/i, /^(?:>)/i, /^(?:<=)/i, /^(?:>=)/i, /^(?:IN)/i, /^(?:NOT)/i, /^(?:-)/i, /^(?:BOUND)/i, /^(?:BNODE)/i, /^(?:(RAND|NOW|UUID|STRUUID))/i, /^(?:(LANG|DATATYPE|IRI|URI|ABS|CEIL|FLOOR|ROUND|STRLEN|STR|UCASE|LCASE|ENCODE_FOR_URI|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|MD5|SHA1|SHA256|SHA384|SHA512|isIRI|isURI|isBLANK|isLITERAL|isNUMERIC))/i, /^(?:(LANGMATCHES|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|STRLANG|STRDT|sameTerm))/i, /^(?:CONCAT)/i, /^(?:COALESCE)/i, /^(?:IF)/i, /^(?:REGEX)/i, /^(?:SUBSTR)/i, /^(?:REPLACE)/i, /^(?:EXISTS)/i, /^(?:COUNT)/i, /^(?:SUM|MIN|MAX|AVG|SAMPLE)/i, /^(?:GROUP_CONCAT)/i, /^(?:SEPARATOR)/i, /^(?:\^\^)/i, /^(?:true)/i, /^(?:false)/i, /^(?:(<([^<>\"\{\}\|\^`\\\u0000-\u0020])*>))/i, /^(?:((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:))/i, /^(?:(((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:)((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%)))))?)))/i, /^(?:(_:(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?))/i, /^(?:([\?\$]((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])*)))/i, /^(?:(@[a-zA-Z]+(-[a-zA-Z0-9]+)*))/i, /^(?:([0-9]+))/i, /^(?:([0-9]*\.[0-9]+))/i, /^(?:([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+)))/i, /^(?:(\+([0-9]+)))/i, /^(?:(\+([0-9]*\.[0-9]+)))/i, /^(?:(\+([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i, /^(?:(-([0-9]+)))/i, /^(?:(-([0-9]*\.[0-9]+)))/i, /^(?:(-([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i, /^(?:([eE][+-]?[0-9]+))/i, /^(?:('(([^\u0027\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/i, /^(?:("(([^\u0022\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/i, /^(?:('''(('|'')?([^'\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/i, /^(?:("""(("|"")?([^\"\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/i, /^(?:(\((\u0020|\u0009|\u000D|\u000A)*\)))/i, /^(?:(\[(\u0020|\u0009|\u000D|\u000A)*\]))/i, /^(?:$)/i, /^(?:.)/i, /^(?:.)/i],
	            conditions: { "INITIAL": { "rules": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120], "inclusive": true } }
	        };
	        return lexer;
	    }();
	    parser.lexer = lexer;
	    function Parser() {
	        this.yy = {};
	    }
	    Parser.prototype = parser;parser.Parser = Parser;
	    return new Parser();
	}();

	if (true) {
	    exports.parser = sparqlParser;
	    exports.Parser = sparqlParser.Parser;
	    exports.parse = function () {
	        return sparqlParser.parse.apply(sparqlParser, arguments);
	    };
	    exports.main = function commonjsMain(args) {
	        if (!args[1]) {
	            console.log('Usage: ' + args[0] + ' FILE');
	            process.exit(1);
	        }
	        var source = __webpack_require__(77).readFileSync(__webpack_require__(78).normalize(args[1]), "utf8");
	        return exports.parser.parse(source);
	    };
	    if (typeof module !== 'undefined' && __webpack_require__.c[0] === module) {
	        exports.main(process.argv.slice(1));
	    }
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(57)(module)))

/***/ },
/* 77 */
/***/ function(module, exports) {

	

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe =
	    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = (i >= 0) ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function(p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function(path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};


	// path.relative(from, to)
	// posix version
	exports.relative = function(from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function(path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};


	exports.basename = function(path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPath(path)[3];
	};

	function filter (xs, f) {
	    if (xs.filter) return xs.filter(f);
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        if (f(xs[i], i, xs)) res.push(xs[i]);
	    }
	    return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b'
	    ? function (str, start, len) { return str.substr(start, len) }
	    : function (str, start, len) {
	        if (start < 0) start = str.length + start;
	        return str.substr(start, len);
	    }
	;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }
/******/ ])
});
;