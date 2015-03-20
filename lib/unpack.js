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

function bowerOrPackageJson(entry) {
  return /^(bower|package)\.json/.test(entry.entryName);
}

function getLeadingDirectory(entry) {
  return entry.entryName.split("/")[0];
}

function ignore(entry) {
  entry.entryName = ".ignored-" + entry.entryName;
}

function prettyPath(_path) {
  var relativePath = path.relative(".", _path);
  return relativePath.length + 2 > _path.length ? _path : "./" + relativePath;
}

function stripLeadingDirectory(entry) {
  return entry.entryName = entry.entryName.split("/").slice(1).join("/");
}

function unique(sum, i) {
  if (sum.indexOf(i) === -1) {
    sum.push(i);
  }
  return sum;
}

function unpack(downloads, dest) {
  var zip;

  console.log("Unpacking it into `" + prettyPath(dest.path) + "`");

  mkdirp(dest.path, "0755");

  downloads.forEach(function(download) {
    var entries;
    try {
      zip = new AdmZip(download);
      entries = zip.getEntries();
      // Strip the leading directory in case it holds all files.
      if (entries.map(getLeadingDirectory).reduce(unique, []).length === 1) {
        entries.forEach(stripLeadingDirectory);
      }
      // Ignore/rename bower.json or package.json files
      entries.filter(bowerOrPackageJson).forEach(ignore);
      zip.extractAllTo(dest.path, true);
    } catch(error) {
      // AdmZip throws strings, not errors!!
      if (typeof error === "string") {
        throw new Error(error);
      }
      throw error;
    }
  });
}

module.exports = function(dest) {
  return function(download) {
    unpack(download, dest);
  };
};
