var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('compile', function() {
  return gulp.src("src/*.ts")
    .pipe( sourcemaps.init() )
    .pipe( ts({"out": "golden.js"}) ).js
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest("build") );
});

gulp.task('lib', function() {
  return gulp.src("node_modules/three/three.js")
    .pipe( gulp.dest("build") );
});

gulp.task("default", ["compile", "lib"]);

gulp.task('min', function() {
  return gulp.src([ 'build/golden.js', 'build/three.js' ])
    .pipe( concat("golden.min.js") )
    .pipe( uglify() )
    .pipe( gulp.dest("build") );
});
