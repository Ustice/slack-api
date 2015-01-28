# slack-api

A javascript wrapper for the Slack API.

## Installation

Installation is easy, like any package on [npm](http://npmjs.org), you can add it to your project by typing the following in the terminal in your project directory:

````
npm install --save slack-api
````

## Usage

_slack-api_ uses the same structure as the Slack Web API, and follows Node convention for calling methods.

````javascript
'use strict';

var Slack = require('slack-api');

Slack.api.test({}, function (error, data) {
  console.log(data);
});
````

## API

_slack-api_ shares the same methods as the Slack Web API, but with a few additions.

You can find the full Slack Web API documentation on [their site](https://api.slack.com/methods).

If _slack-api_ is missing a method [let us know](https://github.com/ustice/slack-api/issues), or better yet, [update it](#development-and-testing).

### oauth.getUrl(options, [callback=noop])

This method generates the url used for step 1 of the [Slack OAuth](https://api.slack.com/docs/oauth) flow.

#### Arguments

1. **options** _(Object)_ - options hash should have the following properties:

  ````
  client_id    - issued when you created your application (required)
  redirect_uri - URL to redirect back to (see below) (optional)
  scope        - permissions to request (see below) (optional)
  state        - unique string to be passed back upon completion
  team         - Slack team ID to restrict to (optional)
  ````
2. **[callback=noop]** _(Function)_ - Function to be called upon completion. If none is provided, this method will simply execute silently.

#### Returns

This method invokes the `callback` argument function in the standard node.js style (`callback(error, data)`), where `data` is the url _(String)_
that the user should be redirected to to start the OAuth process for slack.

### oauth.access(options, [state], [callback=noop])

This method allows you to exchange a temporary OAuth code for an API access token. This is used as part of the OAuth authentication flow.

This method will optionally perform the state check for you, should you provide it.

#### Arguments
1. **options** _(Object)_ - options hash should have the following properties:

  ````
  client_id     - issued when you created your application (required)
  client_secret	- issued when you created your application (required)
  code	        - the code param returned via the OAuth callback (required)
  redirect_uri	- this must match the originally submitted URI (if one was sent)
  ````
2. **[state]** _(String)_ - unique string passed to the original authorization call (optional)
3. **[callback=noop]** _(Function)_ - Function to be called upon completion. If none is provided, this method will simply execute silently.

#### Returns

This method invokes the `callback` argument function in the standard node.js style (`callback(error, data)`).

### promisify()

This method returns a [promisified](https://github.com/petkaantonov/bluebird) version of the Slack API library.

````javascript
'use strict';

var Slack = require('slack-api').promisify();

Slack.api.test({}).then(function (data) {
  console.log(data);
}).catch(Slack.errors.SlackError, function (error) {
  console.log('Slack did not like what you did: ' + error.message);
}).catch(Slack.errors.CommunicationError, function (error) {
  console.error('Error communicating with Slack. ' + error.message);
}).catch(Slack.errors.SlackServiceError, function (error) {
  console.error('Error communicating with Slack. ' + error.message);
  //To get error details
  console.error(error.errorDetails);
});
````

## Errors

The slack-api comes with some custom errors, and their constructors are included under the `errors` property.

* `CommunicationError` - This error is thrown if the https request fails e.g. because of a network problem.
* `SlackError` - If Slack returns an error, this error will be passed to the callback function as the first argument for error-handling.
* `SlackServiceError` - If Slack returns a non-200 status code, this error will be passed to the callback function as the first argument for error-handling. The error details are provided as a property on the error called `errorDetails`. `SlackServiceError` is different from `SlackError` because the Slack API returns a `200` status code for the kinds of errors identified by `SlackError`. 

## Development and testing

If you want to contribute, simply clone this repo, and run

````
npm install
````

Tests are written for mocha, and can be run with

````
npm test
````
