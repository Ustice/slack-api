# slack-api

A javascript wrapper for the Slack API.

## Installation

Installation is easy, like any package on [npm](http://npmjs.org), you can add it to your project by typing the following in the terminal in your project directory:

````
npm install --save slack-api
````

## Usage

_slack-api_ uses the same structure as the Slack Web API, and follows Node convention for calling methods.

```` (javascript)
'use strict';

var Slack = require('slack-api');

Slack.api.test({}, function (error, data) {
  console.log(data);
});
````

## API

_slack-api_ shares the same methods as the Slack Web API, but with a few additions.

You can find the full Slack Web API documentation on [their site](https://api.slack.com/methods).

If _slack-api_ is missing a method [let us know](https://github.com/ustice/slack-api/issues), or better yet, [update it](#developemnt-and-testing).

### oauth.getUrl(options)

This method generates the url used for step 1 of the [Slack OAuth](https://api.slack.com/docs/oauth) flow.

#### Arguments

1. *options* _(Object)_ - options hash should have the following properties:
  ````
  client_id    - issued when you created your application (required)
  redirect_uri - URL to redirect back to (see below) (optional)
  scope        - permissions to request (see below) (optional)
  state        - unique string to be passed back upon completion
  team         - Slack team ID to restrict to (optional)
  ````

#### Returns

_(String)_ - Returns the url that the user should be redirected to to start the OAuth process for slack.

## Errors

The slack-api comes with some custom errors, and their constructors are included under the `errors` property.

* CommunicationError - This error is thrown if the https request fails.
* SlackError - If Slack returns an error, this will be passed to the callback function as the first argument for error-handling.

## Development and testing

If you want to contribute, simply clone this repo, and run

````
npm install
````

Tests are written for mocha, and can be run with

````
npm test
````
