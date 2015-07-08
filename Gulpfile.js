'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var webpack = require('webpack');
var argv = require('minimist')(process.argv.slice(2));
var runSequence = require('run-sequence');

//var webpack = require('webpack-stream');

var clean = require('gulp-clean');
var rename = require('gulp-rename');
var path = require('path');
var less = require('gulp-less');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var csslint = require('gulp-csslint');
var mocha = require('gulp-mocha');
var jscs = require('gulp-jscs');
var eslint = require('gulp-eslint');

var watch = false;

var files = {
    js: [
        'src/app.js',
        'src/**/*.js',
        'Gruntfile.js'
    ],

    less: [
        'src/style.less',
    ]
};
/*****************************second method with settin webpack in gruntFile*************************************/
gulp.task('clean', function () {
    return gulp.src('./build')
        .pipe(clean({ force: true }));
});

gulp.task('copy', function () {
    gulp.src('./src/index.html')
        .pipe(gulp.dest('./build/'));
});

gulp.task('webpack', function () {
    gulp.src('./src/app.js')
        .pipe(webpack({
                output: {
                    filename: 'app.js'
                },
                target: 'web',
                resolve: {
                    extensions: [
                        '',
                        '.js',
                        '.json'
                    ],
                    modulesDirectories: [ 'node_modules', 'src', 'node_modules/**/node_modules' ],
                    root: path.join(__dirname, './')
                },
                module: {
                    loaders: [
                        { test: /\.js$/, loader: 'transform?brfs!jsx-loader', exclude: /(node_modules)/ },
                        { test: /\.json$/, loader: 'json-loader' }
                    ]
                }
            }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('less', function () {
    gulp.src('./src/style.less')
        .pipe(less())
        .pipe(gulp.dest('./build/'));
});

gulp.task('postcss', function () {
    var processors = [ autoprefixer() ];

    gulp.src('./build/style.css')
        .pipe(postcss(processors));
});

gulp.task('jscs', function () {
    gulp.src(files.js)
        .pipe(jscs());
});

gulp.task('eslint', function () {
    gulp.src(files.js)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('build', [ 'clean', 'webpack', 'less', 'postcss', 'csslint' ]); //and after copy-task

/*****************************third method with file webpack and webpack*************************************/

gulp.task('bundle', function (cb) {
    var started = false;
    var config = require('./webpack.config.js');
    var bundler = webpack(config);

    function bundle(err, stats) {
        if (err) {
            throw new $.util.PluginError('webpack', err);
        }

        if (argv.verbose) {
            $.util.log('[webpack]', stats.toString({ colors: true }));
        }

        if (!started) {
            started = true;

            return cb();
        }
    }

    if (watch) {
        bundler.watch(200, bundle);
    }
    else {
        bundler.run(bundle);
    }
});

gulp.task('building', [ 'clean' ], function (cb) {
    runSequence([ 'copy', 'less', 'postcss', 'csslint', 'bundle' ], cb);
});

gulp.task('build:watch', function (cb) {
    watch = true;
    runSequence('build', function () {
        gulp.watch(files.js, [ 'copy' ]);
        gulp.watch(files.less, [ 'less' ]);
        cb();
    });
});
