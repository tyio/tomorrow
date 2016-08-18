/**
 * Created by Usnul on 27/11/2014.
 */
'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var cached = require('gulp-cached');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var footer = require('gulp-footer');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var watchify = require('watchify');
var browserify = require('browserify');
var notifier = require('node-notifier');
var connect = require('gulp-connect');
var fs = require('fs');

var styleGlob = 'app/css/**/*.css';
var htmlGlob = 'app/**/*.html';

gulp.task('html', function() {
    return gulp.src(htmlGlob)
        .pipe(gulp.dest('public/'))
        .pipe(connect.reload());
});

gulp.task('css', function () {
    return gulp.src(styleGlob)
            .pipe(concat('main.css'))         // do things that require all files
            .pipe(gulp.dest('public/css/'))
            .pipe(connect.reload());
});

gulp.task('release-build', function () {
    notifier.notify({title: 'release build', message: 'start'});
    var bundler = browserify('./app/js/Library.js');
    return bundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('Tomorrow.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./public'))
        .pipe(notify('done.'));
});

gulp.task('server', function () {
    notifier.notify({
        title: 'Server',
        message: 'booted'
    });

    connect.server({
        root: 'public',
        port: 8080,
        livereload: true
    });
});

gulp.task('watch', function () {
    //html
    gulp.watch(htmlGlob, ['html']);

    //css
    gulp.watch(styleGlob, ['css']);

    var bundler = watchify(browserify('./app/js/main.js', {debug: true}));

    bundler.on('update', rebundle);

    function rebundle(m) {
        notifier.notify({title: 'building', message: 'start'});
        //compile scripts
        return bundler.bundle()
            // log errors if they happen
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write({includeContent: true, sourceRoot: '../app/js'}))
            .pipe(gulp.dest('./public'))
            .pipe(connect.reload())
            .pipe(notify('done.'));
    }

    return rebundle();
});

gulp.task('default', ['html', 'css', 'watch', 'server']);