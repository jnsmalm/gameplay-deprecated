var gulp = require('gulp');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');

gulp.task('hint', function() {
  return gulp.src(['./lib/*.js', './test/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build', shell.task(
  ['make'], { cwd: "build" }
));

gulp.task('test', shell.task(
  ['build/ko test/tests.js']
));

gulp.task('default', ['hint', 'build', 'test']);