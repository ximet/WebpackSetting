'use strict';

var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var DEBUG = !argv.release;
var GLOBALS = {
    'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
    '__DEV__': DEBUG
};
var AUTOPREFIXER_LOADER = 'autoprefixer-loader';

var config = {
    output: {
        path: './build/'
    },
    cashe: DEBUG,
    debug: DEBUG,
    target: 'web',
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin()
    ],
    resolve: {
        extensions: [
        '',
        '.js',
        '.json'
        ],
        modulesDirectories: [ 'node_modules', 'src' ],
        root: path.join(__dirname, './')
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            }
        ],
        loaders: [
            { test: /\.js$/, loader: 'transform?brfs!jsx-loader', exclude: /(node_modules)/ },
            { test: /\.json$/, loader: 'json-loader' }
            //{ test: /\.less$/, loader: 'style-loader!css-loader!' + AUTOPREFIXER_LOADER + '!less-loader'}
        ]
    }

};

var appConfig = _.merge({}, config, {
    entry: './src/app.js',
    output: {
        filename: 'app.js'
    },
    plugins: config.plugins.concat([
            new webpack.DefinePlugin(_.merge(GLOBALS, { '__SERVER__': false }))
        ].concat(DEBUG ? [] : [
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin(),
                new webpack.optimize.AggressiveMergingPlugin()
            ])
    )
});

module.exports = [ appConfig ];
