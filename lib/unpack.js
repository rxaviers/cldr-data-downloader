/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2013 Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/cldr-data-npm/blob/master/LICENSE-MIT
 */

"use strict";

var mkdirp = require("mkdirp");
var path = require("path");
var yauzl = require("yauzl");
var fs = require("fs");

function bowerOrPackageJson(entry) {
  return /^(bower|package)\.json/.test(entry.fileName);
}

function getLeadingDirectory(entry) {
  return entry.fileName.split("/")[0];
}

function ignore(entry) {
  entry.fileName = ".ignored-" + entry.fileName;
}

function prettyPath(_path) {
  var relativePath = path.relative(".", _path);
  return relativePath.length + 2 > _path.length ? _path : "./" + relativePath;
}

function stripLeadingDirectory(entry) {
  return entry.fileName = entry.fileName.split("/").slice(1).join("/");
}

function unique(sum, i) {
  if (sum.indexOf(i) === -1) {
    sum.push(i);
  }
  return sum;
}

function unpack(downloads, dest) {
  console.log("Unpacking it into `" + prettyPath(dest.path) + "`");

  mkdirp(dest.path, "0755");

  var promises = [];

  downloads.forEach(function(download) {

    promises.push(new Promise(function(resolve, reject) {
        // get all the file entries first as an array
        var shouldStripLeadingDirectory = false;

        new Promise(function(resolve1, reject1) {
          // console.log("enumerating all entries of zip");
          var fileList = [];

          yauzl.fromBuffer(download, {lazyEntries: true}, function(err, zipfile) {
            // console.log("reading zip");
            if(err) {
              reject1(err);
            }

            zipfile.on("end", function() {
              // zip has been read completely
              resolve1(fileList);
            });

            zipfile.on("entry", function(entry) {
              fileList.push(entry);
              zipfile.readEntry();
            });

            zipfile.on("error", function(reason) {
              console.log("Failed reading zip. Reason: " + reason);
              reject1(reason);
            });

            zipfile.readEntry();
          });

        }).then(function(fileList) {

          // check if the zip file contains only one folder in its root or not, and if it does mark for stripping it
          if (fileList.map(getLeadingDirectory).reduce(unique, []).length === 1) {
            // console.log("zip contains only one folder. mark it for stripping");
            shouldStripLeadingDirectory = true;
          }

          yauzl.fromBuffer(download, {lazyEntries: true}, function(err, zipfile) {
            if(err) {
              reject(err);
              return;
            }

            zipfile.on("end", function() {
              // zip has been read completely
              resolve();
            });

            zipfile.on("error", function(reason) {
              reject(reason);
            });

            zipfile.on("entry", function(entry) {

              // Ignore directories
              if(/\/$/.test(entry.fileName)) {
                zipfile.readEntry();
              } else {

                if(shouldStripLeadingDirectory) {
                  stripLeadingDirectory(entry);
                }

                // rename bower.json or package.json files, so they do not cause any conflict
                if(bowerOrPackageJson(entry)) {
                  ignore(entry);
                }

                var fileDestPath = dest.path + "/" + entry.fileName;

                // file entry
                zipfile.openReadStream(entry, function(err, readStream) {
                  // console.log("read entry fileName: " + entry.fileName);
                  if(err) {
                    console.error("error while reading entry " + entry.fileName + ": " + err);
                    throw err;
                  }
                  readStream.on("end", function() {
                    zipfile.readEntry();
                  });

                  var writeIt = function() {
                    // console.log("creating write stream to: " + fileDestPath);
                    var writeStream = fs.createWriteStream(fileDestPath);
                    readStream.pipe(writeStream);
                  };

                  if(!fs.existsSync(path.dirname(fileDestPath))) {
                    // console.log("path doesn't exist, creating it: " + fileDestPath);
                    fs.promises.mkdir(path.dirname(fileDestPath), {recursive: true})
                      .then(writeIt)
                      .catch(console.error);
                  } else {
                    writeIt();
                  }

                });
              }
            });

            // start the loop
            zipfile.readEntry();
          });

        }).catch(function(reason) {
          console.error("failed to unpack file reason: " + reason);
          reject(reason);
        });
      })
    );
  });

  return Promise.all(promises);
}

module.exports = function(dest) {
  return function(download) {
    return unpack(download, dest);
  };
};
