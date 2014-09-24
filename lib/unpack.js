/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-npm/blob/master/LICENSE-MIT
 */

"use strict";

var AdmZip = require("adm-zip");
var mkdirp = require("mkdirp");
var path = require("path");

function prettyPath(_path) {
  var relativePath = path.relative(".", _path);
  return relativePath.length + 2 > _path.length ? _path : "./" + relativePath;
}

function unpack(download, dest) {
  var zip;

  console.log("Unpacking it into `" + prettyPath(dest.path) + "`");

  mkdirp(dest.path, "0755");

  try {
    zip = new AdmZip(download);
    zip.extractAllTo(dest.path, true);
  } catch(error) {
    // AdmZip throws strings, not errors!!
    if (typeof error === "string") {
      throw new Error(error);
    }
    throw error;
  }
}

module.exports = function(dest) {
  return function(download) {
    unpack(download, dest);
  };
};
