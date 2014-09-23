/**
 * Download tool for Unicode CLDR JSON data.
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var assert = require("assert");
var download = require("./lib/download");
var path = require("path");
var Q = require("q");
var unpack = require("./lib/unpack");

Q.longStackSupport = true;

module.exports = function(srcUrl, destPath, callback) {
  assert(typeof srcUrl === "string", "must include srcUrl (e.g," +
    "\"http://www.unicode.org/Public/cldr/26/json.zip\")");

  assert(typeof destPath === "string", "must include destPath (e.g," +
    "\"./cldr\")");

  assert(typeof callback === "function", "must include callback function");

  download({
    url: srcUrl
  }).then(unpack({
    path: destPath
  })).catch(callback).done(function() {
    callback();
  });
};
