module.exports = function(grunt) {

  "use strict";

  var pkg = require("./package.json");

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      source: {
        src: [ "index.js", "bin/**.js", "lib/**.js" ],
        options: {
          jshintrc: ".jshintrc"
        }
      },
      grunt: {
        src: [ "Gruntfile.js" ],
        options: {
          jshintrc: ".jshintrc"
        }
      },
      metafiles: {
        src: [ "bower.json", "package.json" ],
        options: {
          jshintrc: ".jshintrc"
        }
      }
    },
    dco: {
      current: {
        options: {
          committish: "0b0ab50702b7bca7ae5e084b1b8732a39582d2b4..HEAD",
          exceptionalAuthors: {
            "rxaviers@gmail.com": "Rafael Xavier de Souza"
          }
        }
      }
    }
  });

  require( "matchdep" ).filterDev( "grunt-*" ).forEach( grunt.loadNpmTasks );

  grunt.registerTask( "default", [
    "jshint:metafiles",
    "jshint:grunt",
    "jshint:source",
    "dco"
  ]);

};

