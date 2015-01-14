# slack-api

A javascript wrapper for the Slack API.

You can find the Slack API documentation on [their site](https://api.slack.com/methods).

## Installation

Installation is easy, like any package on [npm](http://npmjs.org), you can add it to your project by typing the following in the terminal in your project directory:

````
npm install --save slack-api
````

## Usage

slack-api uses the same structure as the Slack REST API, and follows Node convention for calling methods.

```` (javascript)
'use strict';

var Slack = require('slack-api');

Slack.api.test({}, function (error, data) {
  console.log(data);
});
````

## Errors

The slack-api comes with some custom errors, and their constructors are included under the #errors array

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
