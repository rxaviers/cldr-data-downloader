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
var path = require("path");
var fs = require("fs");
const axios = require("axios").default;
var workingDir = process.cwd();

function getRequestOptions(options) {
  options = extend(extend({}, options), {
    // Get response as a buffer
    responseType: "arraybuffer",
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

  return axios.get(src.url, options)
    .then((response) => {
      if (response.status !== 200) {
        const error = new Error("Error requesting archive.\n" +
          "Status: " + response.statusCode + "\n" +
          "Request options: " + JSON.stringify(options, null, 2) + "\n" +
          "Response headers: " + JSON.stringify(response.headers, null, 2) + "\n" +
          "Make sure your network and proxy settings are correct.\n\n" +
          "If you continue to have issues, please report this full log at " +
          "https://github.com/rxaviers/cldr-data-downloader");
        throw error;
      } else {
        const body = response.data;
        notify({received: body.length, percent: 100});
        return body;
      }

    }).catch((errorOrResponse) => {
      if (errorOrResponse instanceof Error) {
        errorOrResponse.message = "Error making request.\n" + errorOrResponse.stack + "\n\n" +
        "Please report this full log at " +
        "https://github.com/rxaviers/cldr-data-downloader";
        throw errorOrResponse;
      } else {
        const error = new Error("Error requesting archive.\n" +
          "Status: " + errorOrResponse.statusCode + "\n" +
          "Request options: " + JSON.stringify(options, null, 2) + "\n" +
          "Response headers: " + JSON.stringify(errorOrResponse.headers, null, 2) + "\n" +
          "Make sure your network and proxy settings are correct.\n\n" +
          "If you continue to have issues, please report this full log at " +
          "https://github.com/rxaviers/cldr-data-downloader");
        throw error;
      }
    });
}

module.exports = download;
