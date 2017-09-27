"use strict";

// Получение настроек проекта из projectConfig.json
let projectConfig = require('./projectConfig.json');
let path = projectConfig.directories;
let lists = getFilesList(projectConfig);
// console.log(lists);

const fs = require('fs');
const gulp = require('gulp');
const notify = require('gulp-notify');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const include = require('gulp-file-include');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const minify = require('gulp-csso');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const run = require('run-sequence');
const wait = require('gulp-wait');
const del = require('del');
const size = require('gulp-size');
const server = require('browser-sync');
const reload = server.reload;

// Генерация style.scss
let styleImports = '/*!*\n * ВНИМАНИЕ! Этот файл генерируется автоматически.\n * Не пишите сюда ничего вручную, все такие правки будут потеряны.\n * Читайте ./README.md для понимания.\n */\n\n';
lists.css.forEach(function(blockPath) {
  styleImports += '@import \''+blockPath+'\';\n';
});
fs.writeFileSync(path.srcPath + 'scss/style.scss', styleImports);


// Локальный сервер + слежение за изменением файлов
gulp.task('serve', function() {
  server({
    server: {
      baseDir: path.buildPath
    },
    port: 8080,
    open: true,
    notify: false
  });
  gulp.watch(path.watch.html, ['html']);
  gulp.watch(path.watch.style, ['css']);
});

// Очистка папки build
gulp.task('clean', function() {
  console.log('---------- Очистка папки сборки');
  return del(path.buildPath);
});

// Cборка html
gulp.task('html', function () {
  console.log('---------- Сборка html');
  gulp.src(path.src.html)
    .pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title: 'HTML compilation error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(include({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(gulp.dest(path.buildPath))
    .pipe(reload({stream: true}));
});

// Сборка стилей
gulp.task('css', function() {
  console.log('---------- Cборка стилей');
  gulp.src(path.srcPath + 'scss/style.scss')
    .pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title: 'Styles compilation error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
				sort: false })
    ]))
    .pipe(gulp.dest(path.public.css))
    .pipe(minify())
    .pipe(rename('style-min.css'))
    .pipe(size({
      title: 'Размер',
      showFiles: true,
      showTotal: false,
    }))
    .pipe(gulp.dest(path.public.css))
    .pipe(reload({stream: true}));
});

// Сборка SVG-спрайта
gulp.task('symbols', function() {
  console.log('---------- Cборка спрайта');
  return gulp.src(path.src.sprite)
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest(path.public.images));

});

// Оптимизация изображений
gulp.task('images', function() {
  console.log('---------- Оптимизация изображений');
  return gulp.src(path.src.images)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
		]))
    .pipe(gulp.dest(path.public.images))
    .pipe(reload({stream: true}));
});

// Оптимизация JS
gulp.task('js', function () {
  console.log('---------- Оптимизация JS');
  gulp.src(path.src.js)
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(path.public.js))
    .pipe(reload({stream: true}));
});

// Копирование шрифтов в папку build
gulp.task('copy:fonts', function() {
  console.log('---------- Копирование шрифтов');
  gulp.src(path.src.fonts)
    .pipe(size({
      title: 'Размер',
      showFiles: true,
      showTotal: false,
    }))
    .pipe(gulp.dest(path.public.fonts));
});

// Запуск сборки проекта
gulp.task('build', function() {
  console.log('---------- Начата сборка проекта');
  run(
    'clean',
    'html',
    'css',
    'images',
    'symbols',
    'js',
    'copy:fonts'
  );
});

function getFilesList(config){

  let res = {
    'css': [],
    'js': [],
    'img': [],
  };

  // Запись @import-ов в style.css
  for (let blockName in config.blocks) {
    res.css.push(path.srcPath + path.blocksDirName + '/' + blockName + '/' + blockName + '.scss');
    if(config.blocks[blockName].length) {
      config.blocks[blockName].forEach(function(elementName) {
        res.css.push(config.path.srcPath + config.path.blocksDirName + '/' + blockName + '/' + blockName + elementName + '.scss');
      });
    }
  }
  res.css = res.css.concat(config.addCssAfter);
  res.css = config.addCssBefore.concat(res.css);

  // JS
  // for (let blockName in config.blocks) {
  //   res.js.push(path.srcPath + path.blocksDirName + '/' + blockName + '/' + blockName + '.js');
  //   if(config.blocks[blockName].length) {
  //     config.blocks[blockName].forEach(function(elementName) {
  //       res.js.push(config.path.srcPath + config.path.blocksDirName + '/' + blockName + '/' + blockName + elementName + '.js');
  //     });
  //   }
  // }
  // res.js = res.js.concat(config.addJsAfter);
  // res.js = config.addJsBefore.concat(res.js);

  // Images
  // for (let blockName in config.blocks) {
  //   res.img.push(config.path.srcPath + config.path.blocksDirName + '/' + blockName + '/img/*.{jpg,jpeg,gif,png,svg}');
  // }
  // res.img = config.addImages.concat(res.img);
  //
  return res;
}

/**
 * Проверка существования файла или папки
 * @param  {string} path      Путь до файла или папки]
 * @return {boolean}
 */
function fileExist(path) {
  const fs = require('fs');
  try {
    fs.statSync(path);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }
}
