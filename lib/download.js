/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var extend = require("util")._extend;
var progress = require("progress");
var Q = require("q");
var requestProgress = require("request-progress");
var request = require("request");

function getRequestOptions(options) {
  options = extend(extend({}, options), {

    // Get response as a buffer
    encoding: null,

     // The default download path redirects to a CDN URL.
    followRedirect: true,

    // If going through proxy, spoof the User-Agent, since may commerical proxies block blank or unknown agents in headers
    headers: {
      "User-Agent": "curl/7.21.4 (universal-apple-darwin11.0) libcurl/7.21.4 OpenSSL/0.9.8r zlib/1.2.5"
    }
  });

  return options;
}

function download(src) {
  var bar;
  var downloadDfd = Q.defer();
  var options = getRequestOptions(src);

  function reportProgress(state) {
    if (!bar) {
      bar = new progress("  [:bar] :percent :etas", {
        total: state.total || 0,
        width: 40
      });
    }
    if(!bar.complete) {
      bar.tick(state.received);
    }
  }

  console.log("GET `" + src.url + "`");

  requestProgress(request(options, function(error, response, body) {

    if (error) {
      error.message = "Error making request.\n" + error.stack + "\n\n" +
        "Please report this full log at " +
        "https://github.com/rxaviers/cldr-data-downloader";
      downloadDfd.reject(error);
      throw error;
    } else if (!response) {
      error = new Error("Something unexpected happened, please report this" +
        "full log at https://github.com/rxaviers/cldr-data-downloader");
      downloadDfd.reject(error);
      throw error;
    } else if (response.statusCode !== 200) {
      error = new Error("Error requesting archive.\n" +
        "Status: " + response.statusCode + "\n" +
        "Request options: " + JSON.stringify(options, null, 2) + "\n" +
        "Response headers: " + JSON.stringify(response.headers, null, 2) + "\n" +
        "Make sure your network and proxy settings are correct.\n\n" +
        "If you continue to have issues, please report this full log at " +
        "https://github.com/rxaviers/cldr-data-downloader");
      downloadDfd.reject(error);
      throw error;
    }

    reportProgress({received: body.length, percent: 100});
    console.log("Received " + Math.floor(body.length / 1024) + "K total.");
    downloadDfd.resolve(body);

  })).on("progress", reportProgress);

  return downloadDfd.promise;
}

module.exports = download;
