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
    "  -h, --help              # Print options and usage.",
    "  -v, --version           # Print the version number.",
    "  -i, --input             # Source URL for the Unicode CLDR JSON zip,",
    "                          # or a JSON config file with a `core` key",
    "                          # pointing to a URL value. Use --src-url-key",
    "                          # (or its alias --coverage) to set a different",
    "                          # key.",
    "  -o, --output            # Destination path to unpack JSONs at.",
    "  -f, --force             # Force to re-download and to re-unpack.",
    "  --filter                # Regexp URL mask: '(core|numbers)' etc. Useful",
    "                          # when input is for external .json config",
    ""
  ];

  return out.join("\n");
}

options = {};
opts = nopt({
  help: Boolean,
  version: Boolean,
  input: String,
  "src-url-key": String,
  "coverage": String,
  filter: String,
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

options.force = opts.force;
options.filterRe = opts.filter;
options.srcUrlKey = opts["src-url-key"] || opts.coverage;

download(opts.input, opts.output, options, function(error) {
  if (error) {
    if (/E_ALREADY_INSTALLED/.test(error.code)) {
      error.message = error.message.replace(/Use `options.*/, "Use -f to " +
        "override.");
      return console.log(error.message);
    } else {
      console.error("Whops", error.message);
      process.exit(1);
    }
  }
});
