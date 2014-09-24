#!/usr/bin/env node

/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var download = require("../index");
var nopt = require("nopt");
var path = require("path");
var pkg = require("../package.json");

var options, opts, requiredOpts;

function help() {
  var out = [
    "Usage: download -i srcUrl -o destPath",
    "",
    "General options:",
    "  -h, --help              # Print options and usage",
    "  -v, --version           # Print the version number",
    "  -i, --input             # Source URL for the Unicode CLDR JSON zip",
    "  -o, --output            # Destination path to unpack JSONs at",
    "  -f, --force             # Force to re-download and to re-unpack",
    ""
  ];

  return out.join("\n");
}

options = {};
opts = nopt({
  help: Boolean,
  version: Boolean,
  input: String,
  output: path,
  force: Boolean
}, {
  h: "--help",
  v: "--version",
  i: "--input",
  o: "--output",
  f: "--force"
});
requiredOpts = true;

if (opts.version) {
  return console.log(pkg.version);
}

if (!opts.input || !opts.output) {
  requiredOpts = false;
}

if (opts.help || !requiredOpts) {
  return console.log(help());
}

if (opts.force) {
  options.force = true;
}

download(opts.input, opts.output, options, function(error) {
  if (error) {
    if (/E_ALREADY_INSTALLED/.test(error.code)) {
      error.message = error.message.replace(/Use `options.*/, "Use -f to " +
        "override.");
      return console.log(error.message);
    } else {
      console.error("Whops", error.message);
      exit(1);
    }
  }
  console.log("Done");
});
