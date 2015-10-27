/*
  Project: Golden
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/golden/
*/
var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var KarmaServer = require('karma').Server;

// Compile TypeScript and generate source map
//
gulp.task('compile', function() {
  return gulp.src("src/*.ts")
    .pipe( sourcemaps.init() )
    .pipe( ts({"out": "golden.js"}) ).js
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest("build") );
});

// Compile libraries
//
gulp.task('lib', function() {
  return gulp.src("node_modules/three/three.js")
    .pipe( gulp.dest("build") );
});

gulp.task("default", ["compile", "lib"]);

// Run unit tests
//
gulp.task('test-compile', function() {
  return gulp.src([
      "typings/jasmine/jasmine.d.ts",
      "spec/support/utils.ts",
      "spec/*.ts",
    ])
    .pipe( sourcemaps.init() )
    .pipe( ts({"out": "spec.js"}) ).js
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest("spec/build") );

    return merge(gameSource, gameTestSuite);
});

gulp.task('test', ['test-compile'], function( done ) {
  new KarmaServer({
    configFile: __dirname + '/spec/karma.conf.js',
    singleRun: true
  }, done).start();
});

// Minify the build
//
gulp.task('min', function() {
  return gulp.src([ 'build/golden.js', 'build/three.js' ])
    .pipe( concat("golden.min.js") )
    .pipe( uglify() )
    .pipe( gulp.dest("build") );
});
