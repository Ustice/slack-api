'use strict';

var chai = require('chai');
var api = require(__dirname + '/../index');
var errorFactory = require(__dirname + '/../lib/error-factory');

// Custom Errors
var AuthenticationError = errorFactory('AuthenticationError');
var CommunicationError = errorFactory('CommunicationError');
var SlackError = errorFactory('SlackError');

var expect = chai.expect;

var SLACK_TOKEN = process.env.SLACK_TOKEN;

if (!SLACK_TOKEN) {
  console.log('Slack authentication token not found.');
  console.log('Please set your access token to the environment variable SLACK_TOKEN.');
  console.log('You can find it here: https://api.slack.com/web#basics');
  console.log('Aborting tests.');
  process.exit(1);
}

describe('SlackAPI', function () {
  this.timeout(5000);
  describe('api', function () {
    describe('test', function () {
      it('should return okay when not given an error', function (done) {
        api.api.test({}, function (error, data) {
          expect(data.ok).to.be.true;
          done();
        });
      });
      it('should return an error, when given an error argument', function (done) {
        api.api.test({error: 'test_error'}, function (error, data) {
          expect(data.ok).to.be.false;
          expect(data.error).to.equal('test_error');
          done();
        })
      })
    });
  });
  describe('auth', function () {
    describe('test', function () {
      it('should throw an error when no token is passed', function (done) {
        try {
          api.auth.test({}, function (error, data) {
            done(new Error('Method should not return a value, but instead throw an error.'));
          });
        } catch (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          done();
        }

      });
      it('should fail as invalid_auth when an invalid token is passed', function (done) {
        api.auth.test({token: 'BAD TOKEN'}, function (error, data) {
          expect(error).to.be.ok;
          expect(data.error).to.equal('invalid_auth');
          done();
        });
      });
      it('should return user data when the token is valid', function (done) {
        api.auth.test({token: SLACK_TOKEN}, function (error, data) {
          expect(error).to.be.null;
          expect(data.ok).to.be.true;
          expect(data.user).to.be.ok;
          done();
        });
      });
    });
  });
});
