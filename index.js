/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var assert = require("assert");
var AvailableLocales = require("./lib/available_locales");
var download = require("./lib/download");
var isUrl = require("./lib/util").isUrl;
var progress = require("./lib/progress");
var Q = require("q");
var readJSON = require("./lib/util").readJSON;
var State = require("./lib/state");
var unpack = require("./lib/unpack");

Q.longStackSupport = true;

function alwaysArray(arrayOrSomething) {
  return Array.isArray(arrayOrSomething) ?
    arrayOrSomething :
    arrayOrSomething ? [arrayOrSomething] : [];
}

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

  Q.try(function() {

    // Is srcUrl a config file?
    if (!isUrl(srcUrl) && (/.json$/i).test(srcUrl)) {
      // Read its URL.
      options.srcUrlKey = options.srcUrlKey || "core";
      srcUrl = readJSON(srcUrl)[options.srcUrlKey];
    }

    // Is it already installed?
    state = new State(srcUrl, destPath);
    if (!options.force && state.isInstalled()) {
      error = new Error("Already downloaded and unpacked, quitting... Use " +
        "`options.force = true` to override.");
      error.code = "E_ALREADY_INSTALLED";
      throw error;
    }

  // Download
  }).then(function() {
    var srcUrls = alwaysArray(srcUrl);

    if (options.filterRe) {
      var filterRe = options.filterRe;
      if (typeof filterRe === "string") {
        filterRe = new RegExp(filterRe);
      }

      srcUrls = srcUrls.filter(function(url) {
        return filterRe.test(url);
      });
    }

    return Q.all(srcUrls.map(function(srcUrl) {
      return download({
        url: srcUrl
      });
    })).progress(progress(srcUrls.length));

  // Unpack
  }).then(unpack({
    path: destPath

  // Generate available locales.
  })).then(function() {
    try {
      new AvailableLocales(destPath).write();
    } catch(error) {
      error.message = "Error generating available locales. " + error.message;
      throw error;
    }

  // Save installation state.
  }).then(function() {
    try {
      state.write();
    } catch(error) {
      error.message = "Error saving installation state. " + error.message;
      throw error;
    }

  // Done
  }).nodeify(callback);
};
