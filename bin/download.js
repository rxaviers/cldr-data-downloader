#!/usr/bin/env node

/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-npm/blob/master/LICENSE-MIT
 */

"use strict";

var download = require("../index");
var nopt = require("nopt");
var path = require("path");
var pkg = require("../package.json");

var opts, requiredOpts;

function help() {
  var out = [
    "Usage: download -i srcUrl -o destPath",
    "",
    "General options:",
    "  -h, --help              # Print options and usage",
    "  -v, --version           # Print the version number",
    "  -i, --input             # Source URL for the Unicode CLDR JSON zip",
    "  -o, --output            # Destination path to unpack JSONs at",
    ""
  ];

  return out.join("\n");
}

requiredOpts = true;
opts = nopt({
  help: Boolean,
  version: Boolean,
  input: String,
  output: path
}, {
  h: "--help",
  v: "--version",
  i: "--input",
  o: "--output"
});

if (opts.version) {
  return console.log(pkg.version);
}

if (!opts.input || !opts.output) {
  requiredOpts = false;
}

if (opts.help || !requiredOpts) {
  return console.log(help());
}

download(opts.input, opts.output, function(error) {
  if (error) {
    console.error("Whops", error.message);
    exit(1);
  }
  console.log("Done");
});
