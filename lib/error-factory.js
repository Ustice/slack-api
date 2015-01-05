'use strict';

module.exports = exports = function errorFactory (errorType) {
  return function customError () {
    var tmp = Error.apply(this, arguments);
    tmp.name = this.name = errorType;

    this.stack = tmp.stack;
    this.message = tmp.message;

    return this;
  };
}
