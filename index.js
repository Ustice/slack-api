'use strict';

var _ = require('lodash');
var errorFactory = require(__dirname + '/lib/error-factory');
var https = require('https');
var querystring = require('querystring');

var endpoints = require(__dirname + '/api-endpoints.json');

// Custom Errors
var CommunicationError = errorFactory('CommunicationError');
var SlackError = errorFactory('SlackError');

var api = _.mapValues(endpoints, function (section, sectionName) {
  return _.mapValues(section, function (method, methodName) {
      return apiMethod(sectionName, methodName);
  });
});

api.errors = [SlackError, CommunicationError];
api.errorFactory = errorFactory;

function apiMethod (sectionName, methodName) {
  return function callApi (args, done) {
    var chunks = [];
    var config;
    var requiredArgs;
    var url;

    // Polymorphism
    if (_.isUndefined(done) && _.isFunction(args)) {
      done = args;
      args = {};
    } else if (_.isUndefined(done) && _.isUndefined(args)) {
      args = {};
      done = function () {};
    }

    if (!api.hasOwnProperty(sectionName)) {
      throw new ReferenceError('API object, ' + sectionName + ', does not exist.');
    }

    if (!api[sectionName].hasOwnProperty(methodName)) {
      throw new ReferenceError('API Method, ' + sectionName + '#' + methodName + ', does not exist.');
    }

    config = endpoints[sectionName][methodName];

    requiredArgs = _.reject(_.keys(config.arguments), function (key) {
      return !config.arguments[key].required;
    });

    _.each(requiredArgs, function (arg) {
      if (_.isUndefined(args[arg])) {
        throw new TypeError('API Method, ' + sectionName + '#' + methodName + ', requires the following args: ' + requiredArgs.join(', '));
      }
    });

    url = config.url + '?' + querystring.stringify(args);

    https.get(url, function (response) {
      var responseText = "";
      response.on('data', function (chunk) {
        chunks.push(chunk);
      });

      response.on('end', function (data) {
        var res = JSON.parse(chunks.join(''));
        if (!res.ok) {
          return done(new SlackError(config.errors[res.error] || res.error), res);
        }

        done(null, res);
      });

      response.on('error', function (error) {
        throw new CommunicationError('Communication error while posting message to Slack. ' + error);
      })
    }).end();
  };
}

module.exports = api;
