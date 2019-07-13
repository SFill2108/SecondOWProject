var { watch, src, dest, parallel, series } = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var twig = require('gulp-twig');
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
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
    server: { baseDir: './www' },
  };

  browserSync.create().init(params);
  cb();
}

  
  function buildAssets(cb) {
    src('src/assets/**/*.*')
      .pipe(dest('www/assets/'));
  
      src(['src/assets/**/*.*', '!src/assets/img/**/*.*'])
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [imageminPngquant()],
        interlaced: true
      }))
      .pipe(dest('www/assets/img'));
      cb();
  }
  
function clearBuild() {
  return del('www/');
}

// Сборка
function buildPages() {
    // Пути можно передавать массивами
    return src(['src/pages/*.twig', 'src/pages/*.html'])
    .pipe(twig())
    .pipe(typograf({ locale: ['ru', 'en-US'] }))
    .pipe(dest('www/'));
  }

  function buildStyles() {
    return src('src/styles/**/*.scss')
        
      .pipe(sass({
        includePaths: require('node-normalize-scss').includePaths
      }))
      .pipe(postcss([
        autoprefixer(),
        cssnano()
      ]))
      .pipe(dest('www/styles/'));
  }

function buildScripts() {
  return src('src/scripts/**/*.js')
    .pipe(dest('www/scripts/'));
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