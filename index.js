'use strict';

var _ = require('lodash');
var errorFactory = require('error-factory');
var querystring = require('querystring');
var request = require('superagent');
var Promise = require('bluebird');

var endpoints = require(__dirname + '/api-endpoints.json');

// Custom Errors
// indicates errors such as a network failure or timeout
var CommunicationError = errorFactory('CommunicationError');

// indicates errors returned by Slack e.g. for incorrect parameters supplied for an endpoint
var SlackError = errorFactory('SlackError');

// signifies that a non-200 status code was returned by Slack. This is different from
// SlackError because Slack returns a 200 status code for the kinds of errors
// identified by SlackError
var SlackServiceError = errorFactory('SlackServiceError', ['message', 'errorDetails']);

var api = _.mapValues(endpoints, function(section, sectionName) {
  return _.mapValues(section, function(method, methodName) {
    return apiMethod(sectionName, methodName);
  });
});

api.errors = {
  SlackError: SlackError,
  SlackServiceError: SlackServiceError,
  CommunicationError: CommunicationError
};

api.oauth.getUrl = function getUrl(options, done) {
  if (typeof options === 'string') {
    options = {
      client_id: options
    };
  }

  if (!options || !options.client_id) {
    throw new ReferenceError('A client_id is required for this method.');
  }

  options.state = options.state || Math.random();

  if (!done || !_.isFunction(done)) {
    done = function noop() {};
  }

  return done(null, 'https://slack.com/oauth/authorize?' + querystring.stringify(options));
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
    throw new ReferenceError('oauth.access requires an options Object as a first argument.');
  }

  if (_.isArray(options) || _.isString(options) || _.isFunction(options)) {
    throw new TypeError('oauth.access requires an options Object as a first argument.');
  }

  if (state && options.state && state !== options.state) {
    return done(new SlackError('States do not match. WARNING! This could mean that the authentication was a forgery.'), null);
  }

  // Access authentication
  return apiMethod('oauth', 'access')(options, done);
};

function promisify() {
  //make sure to bubble up errors instead of console.error'ing them via Bluebird
  //so that client code can add their own catch and error handling
  Promise.onPossiblyUnhandledRejection(function(error) {
    throw error;
  });

  return _.mapValues(api, function(section, sectionName) {
    if (sectionName === 'errors') return section;
    return _.mapValues(section, function(method, name) {
      return Promise.promisify(method);
    });
  });
}

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

    var requiredArgsList = collectRequiredArgs(config.arguments);
    _.each(requiredArgsList, function(requiredArg) {
      if (_.isUndefined(args[requiredArg])) {
        throw new TypeError('API Method, ' + sectionName + '#' + methodName + ', requires the following args: ' + requiredArgsList.join(', '));
      }
    });

    url = config.url + '?' + querystring.stringify(args);

    request
      .get(url)
      .end(function(error, response) {
        if (error) {
          return done(new CommunicationError('Communication error while posting message to Slack. ' + error), null);
        } else {
          if (response.ok) {
            if (!response.body.ok) {
              return done(new SlackError(config.errors[response.body.error] || response.body.error), response.body);
            }
            done(null, response.body);
          } else {
            return done(new SlackServiceError('Did not receive a successful response from Slack.', {
              errorDetails: {
                errorCode: response.statusCode,
                errorResponse: response.body
              }
            }), null);
          }
        }
      });
  }
}

function collectRequiredArgs(configuredArgs) {
  return _.filter(_.keys(configuredArgs), function(key) {
    return configuredArgs[key].required;
  });
}

api.promisify = promisify;
module.exports = api;