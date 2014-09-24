/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var assert = require("assert");
var download = require("./lib/download");
var Q = require("q");
var State = require("./lib/state");
var unpack = require("./lib/unpack");

Q.longStackSupport = true;

/**
 * fn( srcUrl, destPath [, options], callback )
 */
module.exports = function(srcUrl, destPath, options, callback) {
  var error, state;

  if (callback === undefined && typeof options === "function") {
    callback = options;
    options = {};
  }

  assert(typeof srcUrl === "string", "must include srcUrl (e.g., " +
    "\"http://www.unicode.org/Public/cldr/26/json.zip\")");

  assert(typeof destPath === "string", "must include destPath (e.g., " +
    "\"./cldr\")");

  assert(typeof options === "object", "invalid options");

  assert(typeof callback === "function", "must include callback function");

  // Is it already installed?
  Q.try(function() {
    state = new State(srcUrl, destPath);

    if (!options.force && state.isInstalled()) {
      error = new Error("Already downloaded and unpacked, quitting... Use " +
        "`options.force = true` to override.");
      error.code = "E_ALREADY_INSTALLED";
      throw error;
    }

  // Download
  }).then(download({
    url: srcUrl

  // Unpack
  })).then(unpack({
    path: destPath

  // Save installation state
  })).then(function() {
    state.write();

  // Done
  }).catch(callback).done(function() {
    callback();
  });
};
