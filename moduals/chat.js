'use strict';

var _ = require('lodash');
var errorFactory = require(__dirname + '/../custom-errors');
var https = require('https');
var Promise = require('bluebird');
var querystring = require('querystring');

exports.postMessage = function Slack_chat_postMessage (options, callback) {
  var messageData;
  var url;

  if (!options.token) {
    throw new AuthenticationError('token is required.');
  }

  if (!options.channel || !options.text) {
    throw new ReferenceError('Required options: token, channel, text');
  }

  messageData = _.extend({}, options);
  url = 'https://slack.com/api/chat.postMessage?' + querystring.stringify(messageData);

  https.get(url, function (response) {
    response.on('end', function () {
      if (!response.body.ok) {
        return callback(response.body.error, null);
      }

      callback(null, response);
    });

    response.on('error', function (error) {
      throw new CommunicationError('Communication error while posting message to Slack. ' + error);
    })
  }).end();
}

Promise.promisify(module.exports);
