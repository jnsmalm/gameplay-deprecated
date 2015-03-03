var gulp = require('gulp');
var sequence = require('gulp-sequence');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');

gulp.task('hint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build', shell.task(
  ['make'], { cwd: "build" }
));

gulp.task('copy', function() {
  return gulp.src('./build/ko')
    .pipe(gulp.dest(''));
});

gulp.task('default', sequence(['hint', 'build'], 'copy'));