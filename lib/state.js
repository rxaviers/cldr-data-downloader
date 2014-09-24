/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var deepEqual = require("./util").deepEqual;
var fs = require("fs");
var path = require("path");
var readJSON = require("./util").readJSON;

var proto;

function State(srcUrl, destPath) {
  this.srcUrl = srcUrl;
  this.destPath = destPath;
  this.installed = this.isInstalled();
}

proto = State.prototype;

proto.filepath = function() {
  return path.join(this.destPath, "state.json");
};

proto.isInstalled = function() {
  return deepEqual(this.read(), this.toJson());
};

proto.read = function() {
  var filepath = this.filepath();

  if (fs.existsSync(filepath)) {
    return readJSON(filepath);
  }

  return {};
};

proto.toJson = function() {
  return {
    url: this.srcUrl
  };
};

proto.write = function() {
  var data = JSON.stringify(this.toJson(), null, 2);
  fs.writeFileSync(this.filepath(), data);
};

module.exports = State;
