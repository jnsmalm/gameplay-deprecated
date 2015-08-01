var gulp = require('gulp');
var del = require('del');
var zip = require('gulp-zip');
var pkg = require('./package.json');

gulp.task('clean', function (cb) {
  del(['dist/**/*', '!dist/play'], cb);
});

gulp.task('dist', function() {
  var platform = '';
  if (process.platform === 'darwin') {
    platform = '-osx';
  } else if (process.platform === 'win32') {
    platform = '-win';
  }
  return gulp.src(['./{lib,examples}/**/*.{js,glsl,png,ttf}','dist/play','LICENSE'])
    .pipe(zip('gameplay-' + pkg.version + platform + '.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['dist']);