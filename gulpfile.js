var { watch, src, dest, parallel, series } = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var twig = require('gulp-twig');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var typograf = require('gulp-typograf');

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

  
  function buildAssets(cb) {
    src('src/assets/**/*.*')
      .pipe(dest('build/assets/'));
  
    src('src/assets/img/**/*.*')
      .pipe(imagemin())
      .pipe(dest('build/assets/img'));
  }
  
function clearBuild() {
  return del('build/');
}

// Сборка
function buildPages() {
    // Пути можно передавать массивами
    return src(['src/pages/*.twig', 'src/pages/*.html'])
    .pipe(twig())
    .pipe(typograf({ locale: ['ru', 'en-US'] }))
    .pipe(dest('build/'));
  }

  function buildStyles() {
    return src('src/styles/**/*.scss')
      .pipe(sass())
      .pipe(postcss([
        autoprefixer(),
        cssnano()
      ]))
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


function watchFiles() {
    watch(['src/pages/*.twig', 'src/pages/**/*.html'], buildPages);
    watch('src/styles/**/*.scss', buildStyles);
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