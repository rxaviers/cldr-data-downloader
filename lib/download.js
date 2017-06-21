/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var extend = require("util")._extend;
var Q = require("q");
var requestProgress = require("request-progress");
var request = require("request");
var path = require("path");
var fs = require("fs");
var workingDir = process.cwd();

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

function fetchFromFilesystem(src) {
  var fsDfd = Q.defer();

  // We don't need any options here, so we just grab the url
  // and make sure it fits the norms for our platform.
  var givenFilePath = path.normalize(src.url);

  function notify(state) {
    fsDfd.notify(state);
  }

  var filePath;

  // Test if the file path is absolute. If not, then prepend the application
  // directory beforehand, so it can be treated as relative from the app root.
  if (path.isAbsolute(givenFilePath)) {
    filePath = givenFilePath;
  } else {
    filePath = path.join(workingDir, givenFilePath);
  }

  console.log("Retrieving `" + filePath + "`");

  // Getting the errors and size right on the progress bar here is not worth all the setup.
  // Just fail silently here if there's a problem and the error will correctly bubble in the
  // readFile call below.
  var totalSize = 0;
  try {
    var stats = fs.statSync(filePath);
    totalSize = stats.size;
  } catch (e) {}


  // We're gonna go from 0->100 with nothing between for fs.readFile. We could alternatively
  // do a readStream, but it seems like overkill for the filesizes.
  notify({total: totalSize, received: 0, percent: 0});

  // Async request the file
  fs.readFile(filePath, function(error, fileBody) {
      if (error) {
        error.message = "Error retrieving file from disk.\n" + error.stack + "\n\n" +
          "Please report this full log at " +
          "https://github.com/rxaviers/cldr-data-downloader";
        fsDfd.reject(error);
        throw error;
      } else {
        notify({total: totalSize, received: fileBody.length, percent: 100});
        fsDfd.resolve(fileBody);
      }
  });

  return fsDfd.promise;
}

function download(src) {
  src.url = src.url.trim();

  // Modify the url to not be a file protocol uri so we can unify handling files.
  src.url = src.url.replace(/^file:\/\//i, "");

  // Short circuit the download function and grab it from the filesystem if
  // we don't have anything that looks like a protocol (e.g. https/http/ftp/etc).
  if (src.url.indexOf("://") === -1) {
    return fetchFromFilesystem(src);
  }

  var downloadDfd = Q.defer();
  var options = getRequestOptions(src);

  function notify(state) {
    downloadDfd.notify(state);
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

    notify({received: body.length, percent: 100});
    downloadDfd.resolve(body);

  })).on("progress", notify);

  return downloadDfd.promise;
}

module.exports = download;
