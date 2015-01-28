'use strict';

var chai = require('chai');
var api = require(__dirname + '/../index');
var errorFactory = require('error-factory');
var should = require("should");

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

describe('SlackAPI', function() {
  this.timeout(5000);
  describe('api', function() {
    describe('test', function() {
      it('should return okay when not given an error', function(done) {
        api.api.test({}, function(error, data) {
          expect(data.ok).to.be.true;
          done();
        });
      });
      it('should return an error, when given an error argument', function(done) {
        api.api.test({
          error: 'test_error'
        }, function(error, data) {
          expect(data.ok).to.be.false;
          expect(data.error).to.equal('test_error');
          done();
        })
      })
    });
  });
  describe('auth', function() {
    describe('test', function() {
      it('should throw an error when no token is passed', function(done) {
        try {
          api.auth.test({}, function(error, data) {
            throw error;
          });
        } catch (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          error.message.should.equal("API Method, auth#test, requires the following args: token");
          done();
        }

      });
      it('should fail as invalid_auth when an invalid token is passed', function(done) {
        api.auth.test({
          token: 'BAD TOKEN'
        }, function(error, data) {
          expect(error).to.be.ok;
          expect(data.error).to.equal('invalid_auth');
          done();
        });
      });
      it('should return user data when the token is valid', function(done) {
        api.auth.test({
          token: SLACK_TOKEN
        }, function(error, data) {
          expect(error).to.be.null;
          expect(data.ok).to.be.true;
          expect(data.user).to.be.ok;
          done();
        });
      });
    });
  });
  describe('promisification', function() {
    before(function() {
      api = api.promisify();
    });

    describe('api', function() {
      describe('test', function() {
        it('should return okay when not given an error', function(done) {
          api.api.test({}).then(function(data) {
            expect(data.ok).to.be.true;
            done();
          }).catch(function(error) {
            done(error);
          });
        });
        it('should return an error, when given an error argument', function(done) {
          api.api.test({
            error: 'test_error'
          }).then(function(data) {
            expect(data.ok).to.be.false;
            expect(data.error).to.equal('test_error');
            done();
          }).catch(api.errors.SlackError, function(error) {
            console.log(error.blah)
            console.log(error.errorDetails)
            expect(error).to.be.an.instanceof(api.errors.SlackError);
            done();
          }).catch(function(error) {
            done(error);
          });
        })
      });
    });
  });
});