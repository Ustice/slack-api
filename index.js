'use strict';

var _ = require('lodash');
var errorFactory = require(__dirname + '/../custom-errors');
var https = require('https');
var Promise = require('bluebird');
var querystring = require('querystring');

// Custom Errors
var AuthenticationError = errorFactory('AuthenticationError');
var CommunicationError = errorFactory('CommunicationError');

var apiNamespace = ['api', 'auth', 'channels', 'chat', 'emoji', 'files', 'groups', 'im', 'oauth', 'rtm', 'search', 'stars', 'users'];

var api = {};

_.each(apiNamespace, function (namespace) {
  api[namespace] = {};
});
