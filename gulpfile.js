var { watch, src, dest, parallel, series } = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');

// Девсервер
function devServer(cb) {
  var params = {
    watch: true,
    reloadDebounce: 150,
    notify: false,
    server: { baseDir: './build' },
  };

  browserSync.create().init(params);
  cb();
}
function clearBuild() {
  return del('build/');
}

// Сборка
function buildPages() {
  return src('src/*.html')
    .pipe(dest('build/'));
}

function buildStyles() {
  return src('src/styles/*.css')
    .pipe(dest('build/styles/'));
}

function buildScripts() {
  return src('src/scripts/**/*.js')
    .pipe(dest('build/scripts/'));
}

function buildAssets() {
  return src('src/assets/**/*.*')
    .pipe(dest('build/assets/'));
}

// Отслеживание
function watchFiles() {
  watch('src/*.html', buildPages);
  watch('src/styles/*.css', buildStyles);
  watch('src/scripts/**/*.js', buildScripts);
  watch('src/assets/**/*.*', buildAssets);
}

exports.default =
  series(
    clearBuild,
    parallel(
      devServer,
      series(
        parallel(buildPages, buildStyles, buildScripts, buildAssets),
        watchFiles
      )
    )
  );