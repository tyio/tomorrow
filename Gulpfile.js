/**
 * Created by Alex on 27/11/2014.
 */
'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var cached = require('gulp-cached');
var notify = require("gulp-notify");
var remember = require('gulp-remember');
var uglify = require('gulp-uglify');
var react = require('gulp-react');
var header = require('gulp-header');
var footer = require('gulp-footer');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var watchify = require('watchify');
var browserify = require('browserify');
var notifier = require("node-notifier");
var connect = require('gulp-connect');
var fs = require('fs');

var templatesGlob = 'app/templates/src/**/*.jsx';
gulp.task('templates', function () {
    return gulp.src(templatesGlob)
        .pipe(react())
        .pipe(gulp.dest('app/src/templates/'));
});

var styleGlob = 'app/css/**/*.css';
gulp.task('css', function () {
    return gulp.src(styleGlob)
            .pipe(concat('main.css'))         // do things that require all files
            .pipe(gulp.dest('public/css/'))
            .pipe(connect.reload());
});
gulp.task('release-build', function () {
    notifier.notify({title: "release build", message: "start"});
    var bundler = browserify('./app/src/main.js');
    var pipe = bundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./public'))
        .pipe(notify("done."));
    return pipe;
});

var dataTypesForCopy = ["json", "js"]
    .concat(["png", "jpeg", "jpg", "svg"])
    .concat(["ogg", "mp3"])
    .concat(["ttf"]) //fonts
    .join(",");

var dataSourcePath = "app/data";
var dataTargetPath = './public/data/';

gulp.task('copy-data', function () {
    return gulp.src(dataSourcePath + "/**/*.{" + dataTypesForCopy + "}")
        .pipe(gulp.dest(dataTargetPath));
});

var middleWareAssetListKeeper = (function () {
    var rFileExt = /\.([0-9a-z]+)(?:[\?#]|$)/i;

    var assetListFilePathStripped = "preloaderAssetList.json";
    var assetListFilePath = dataSourcePath + "/" + assetListFilePathStripped;
    var assetRootPath = "/data";

    function isAssetPath(path) {
        return path.indexOf(assetRootPath) === 0;
    }

    function fileExtensionFromPath(path) {
        //get extension of file
        var fileExtMatch = path.match(rFileExt);
        if (fileExtMatch !== null) {
            var fileExt = fileExtMatch[fileExtMatch.length - 1];
            return fileExt;
        }
        return null;
    }

    var assetHash = {};

    function guessAssetType(url, ext) {
        var assetDirectory = url.substring(assetRootPath.length);
        while (assetDirectory.charAt(0) === "/") {
            assetDirectory = assetDirectory.substr(1);
        }
        var iSlash = assetDirectory.indexOf("/");
        if (iSlash === -1) {
            assetDirectory = "";
        } else {
            assetDirectory = assetDirectory.substr(0, iSlash);
        }
        switch (ext) {
            case "json":
                switch (assetDirectory) {
                    case "models":
                        return "three.js";
                    case "levels":
                        return "level";
                    default:
                        return "json";
                }
            case "jpg":
            case "jpeg":
            case "png":
                return "image";
            case "ogg":
            case "mp3":
                return "sound";
            default :
                return null;
        }
    }

    function assetLevelByType(type) {
        switch (type) {
            case "three.js":
                return 1;
            case "level":
                return 0;
            case "image":
            case "sound":
            default :
                return 2;
        }
    }

    function tryRegisterAsset(url, ext) {
        if (!assetHash.hasOwnProperty(url)) {
            var type = guessAssetType(url, ext);
            if (type === null) {
                //ignore
                return;
            }
            var level = assetLevelByType(type);
            assetHash[url] = {
                "uri": url,
                "type": type,
                "level": level
            };
            writeAssetList();
        }
    }

    function writeAssetList() {
        var fileContents = [];
        for (var url in assetHash) {
            if (assetHash.hasOwnProperty(url)) {
                var urlStripped = url.substr(assetRootPath.length);
                if (urlStripped === assetListFilePathStripped) {
                    continue; //ignore file to which write will happen
                }
                fileContents.push(assetHash[url]);
            }
        }
        fs.writeFile(assetListFilePath, JSON.stringify(fileContents, 3, 3), function (err) {
            if (err) {
                return console.log(err);
            }

            notifier.notify({
                title: "Asset List",
                message: "saved"
            });
        });
    }

    function processRequest(req, res, next) {

        var url = req.url;
        if (isAssetPath(url)) {
            //strip leading slashes
            while (url.charAt(0) === "/") {
                url = url.substr(1);
            }
            var ext = fileExtensionFromPath(url);
            if (ext !== null) {
                tryRegisterAsset(url, ext)
            }
        }
        next();
    }

    return processRequest;
})();

gulp.task('server-asset-recorder', function () {
    notifier.notify({
        title: "Server",
        message: "booted"
    });

    connect.server({
        root: 'public',
        middleware: function (connect, opt) {
            return [middleWareAssetListKeeper];
        },
        port: 8080,
        livereload: true
    });
});

gulp.task('server', function () {
    notifier.notify({
        title: "Server",
        message: "booted"
    });

    connect.server({
        root: 'public',
        port: 8080,
        livereload: true
    });
});


gulp.task('watch', function () {

    //copy data
    gulp.watch(dataSourcePath + "/**/*.{" + dataTypesForCopy + "}", ['copy-data']);

    //css
    gulp.watch(styleGlob, ['css']);

    //templates
    gulp.watch(templatesGlob, ['templates']);

    //var bundler = watchify(browserify('./app/src/main.js', watchify.args), {debug: true});
    var bundler = watchify(browserify('./app/src/main.js', {debug: true}));

    // Optionally, you can apply transforms
    // and other configuration options on the
    // bundler just as you would with browserify
    //bundler.transform('brfs');


    bundler.on('update', rebundle);

    function rebundle(m) {
        notifier.notify({title: "building", message: "start"});
        //compile scripts
        var pipe = bundler.bundle()
            // log errors if they happen
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write({includeContent: true, sourceRoot: "../app/src"}))
            .pipe(gulp.dest('./public'))
            .pipe(connect.reload())
            .pipe(notify("done."));
        return pipe;
    }

    return rebundle();
});

gulp.task('default', ["copy-data", "css", "templates", "watch", 'server']);