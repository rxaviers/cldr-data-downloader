/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var assert = require("assert");

module.exports = {
  deepEqual: function(a, b) {
    try {
      assert.deepEqual(a, b);
    } catch (error) {
      if (error.name === "AssertionError") {
        return false;
      }
      throw error;
    }
    return true;
  }
};
