'use strict';

var _ = require('lodash');
var errorFactory = require(__dirname + '/lib/error-factory');
var querystring = require('querystring');
var request = require('superagent');

var endpoints = require(__dirname + '/api-endpoints.json');

// Custom Errors
var CommunicationError = errorFactory('CommunicationError');
var SlackError = errorFactory('SlackError');

var api = _.mapValues(endpoints, function(section, sectionName) {
  return _.mapValues(section, function(method, methodName) {
    return apiMethod(sectionName, methodName);
  });
});

api.errors = {
  SlackError: SlackError,
  CommunicationError: CommunicationError
};
api.errorFactory = errorFactory;

api.oauth.getUrl = function getUrl(options) {
  if (typeof options === 'string') {
    options = {
      client_id: options
    };
  }

  if (!options || !options.client_id) {
    throw new ReferenceError('A client_id is required for this method.');
  }

  options.state = options.state || Math.random();

  return 'https://slack.com/oauth/authorize?' + querystring.stringify(options);
};

api.oauth.access = function authorize(options, state, done) {
  // Polymorphism
  if (_.isFunction(state) && _.isUndefined(done)) {
    done = state;
    state = null;
  }

  // Error Handling
  if (!done || !_.isFunction(done)) {
    done = function noop() {};
  }

  if (!options) {
    return done(new ReferenceError('oauth.access requires an options Object as a first argument.'), null);
  }

  if (_.isArray(options) || _.isString(options) || _.isFunction(options)) {
    return done(new TypeError('oauth.access requires an options Object as a first argument.'), null);
  }

  if (state && options.state && state !== options.state) {
    return done(new SlackError('States do not match. WARNING! This could mean that the authentication was a forgery.'), null);
  }

  // Access authentication
  return apiMethod('oauth', 'access')(options, done);
};

function apiMethod(sectionName, methodName) {
  return function callApi(args, done) {
    var config;
    var requiredArgsList;
    var url;

    // Polymorphism
    if (_.isUndefined(done) && _.isFunction(args)) {
      done = args;
      args = {};
    } else if (_.isUndefined(done) && _.isUndefined(args)) {
      args = {};
      done = function() {};
    }

    if (!api.hasOwnProperty(sectionName)) {
      throw new ReferenceError('API object, ' + sectionName + ', does not exist.');
    }

    if (!api[sectionName].hasOwnProperty(methodName)) {
      throw new ReferenceError('API Method, ' + sectionName + '#' + methodName + ', does not exist.');
    }

    config = endpoints[sectionName][methodName];

    checkRequiredArgsPresent(args, config);

    url = config.url + '?' + querystring.stringify(args);

    request
      .get(url)
      .end(function(err, response) {
        if (err) {
          throw new CommunicationError('Communication error while posting message to Slack. ' + error);
        } else {
          if (!response.body.ok)
            return done(new SlackError(config.errors[response.body.error] || response.body.error), response.body);
          done(null, response.body);
        }
      });
  };
}

function checkRequiredArgsPresent(actualArgs, config) {
  var requiredArgsList = collectRequiredArgs(config.arguments);
  _.each(requiredArgsList, function(requiredArg) {
    if (_.isUndefined(actualArgs[requiredArg])) {
      throw new TypeError('API Method, ' + config.sectionName + '#' + config.methodName + ', requires the following args: ' + requiredArgsList.join(', '));
    }
  });
}

function collectRequiredArgs(configuredArgs) {
  return _.filter(_.keys(configuredArgs), function(key) {
    return configuredArgs[key].required;
  });
}

module.exports = api;