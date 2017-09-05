"use strict";

// Получение настроек проекта из projectConfig.json
const pjson = require('./projectConfig.json');
const path = pjson.directories;

const gulp = require('gulp');
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
const del = require('del');
const server = require('browser-sync');
const reload = server.reload;



// Локальный сервер + слежение за изменением файлов
gulp.task('serv', function() {
  server({
    server: {
      baseDir: path.buildPath
    },
    port: 8080,
    open: true,
    notify: false
  });
  gulp.watch(path.watch.html, ['html'])
  gulp.watch(path.watch.style, ['css']);
});

// Очистка папки build
gulp.task('clean', function() {
  return del(path.buildPath);
});

// Cборка html
gulp.task('html', function () {
  console.log('---------- Сборка html');
  gulp.src(path.src.html)
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
  gulp.src('./src/scss/style.scss')
    .pipe(plumber())
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
    .pipe(gulp.dest(path.public.css))
    .pipe(reload({stream: true}));
});

// Оптимизация изображений
gulp.task('images', function() {
  console.log('---------- Оптимизация изображений');
  return gulp.src(path.src.images)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
		]))
    .pipe(gulp.dest(path.public.img))
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
    'js',
    'copy:fonts'
  );
});
