/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-downloader/blob/master/LICENSE-MIT
 */

"use strict";

var fs = require("fs");
var path = require("path");

var proto;

function AvailableLocales(destPath) {
  var mainPath = path.join(destPath, "main");
  this.availableLocales = fs.readdirSync(mainPath).filter(function(filepath) {
    var stats = fs.statSync(path.join(mainPath, filepath));
    return stats.isDirectory();
  });
  this.destPath = destPath;
}

proto = AvailableLocales.prototype;

proto.filepath = function() {
  return path.join(this.destPath, "availableLocales.json");
};

proto.toJson = function() {
  return {
    availableLocales: this.availableLocales
  };
};

proto.write = function() {
  var data = JSON.stringify(this.toJson(), null, 2);
  fs.writeFileSync(this.filepath(), data);
};

module.exports = AvailableLocales;
