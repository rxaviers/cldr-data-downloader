/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var assert = require("assert");
var fs = require("fs");
var url = require("url");

module.exports = {
  deepEqual: function(a, b) {
    try {
      assert.deepEqual(a, b);
    } catch (error) {
      if (error instanceof assert.AssertionError) {
        return false;
      }
      throw error;
    }
    return true;
  },

  isUrl: function(urlOrPath) {
    urlOrPath = url.parse(urlOrPath);
    return urlOrPath.hostname ? true : false;
  },

  readJSON: function(filepath) {
    return JSON.parse(fs.readFileSync(filepath));
  }
};
