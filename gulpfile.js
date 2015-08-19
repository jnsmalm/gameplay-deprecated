var gulp = require('gulp');
var del = require('del');
var seq = require('gulp-sequence');
var zip = require('gulp-zip');
var pkg = require('./package.json');

gulp.task('clean', function (cb) {
  del(['dist/**/*'], cb);
});

gulp.task('dist', function() {
  var platform = '';
  if (process.platform === 'darwin') {
    platform = '-osx';
  } else if (process.platform === 'win32') {
    platform = '-win';
  }
  return gulp.src(
      ['./{lib,examples}/**/*.{js,glsl,png,ttf,obj}','bin/play*','LICENSE'])
    .pipe(zip('gameplay-v' + pkg.version + platform + '.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', seq('clean','dist'));