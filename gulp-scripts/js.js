'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , gulp = require('gulp')
  , minimist = require('minimist')
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , utils = require('../lib/utils')
  , vFs = require('vinyl-fs')
  , webpackAsync = bPromise.promisify(require("webpack"))
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2))
  , inDir = path.join(__dirname, '../src/client/js')
  , isDev = !!argv.dev
  , outDir = path.join(__dirname, '../release/static/js')
  , { streamToPromise } = utils
  , refresh = global.refresh
  ;


//------//
// Main //
//------//

gulp.task('js-build', build)
  .task('js-clean', clean);


//-------------//
// Helper Fxns //
//-------------//

function build() {
  return clean()
    .then(() => {
      const webpackOpts = {
        context: path.join(__dirname, '..')
        , devtool: 'source-map'
        , entry: path.join(inDir, 'index.js')
        , output: {
          filename: 'index.js'
          , path: outDir
          , pathinfo: true
        }
        , module: {
          loaders: [
            {
              test: /\.js$/
              , loader: 'babel'
              , query: {
                presets: ['es2015']
              }
            }
          ]
        }
        , plugins: []
      };

      if (!isDev) {
        webpackOpts.plugins = webpackOpts.plugins.concat(
          new webpackAsync.optimize.UglifyJsPlugin({
            compress: true
            , mangle: true
            , sourceMap: true
          })
        );
      }
      return bPromise.all([
        webpackAsync(webpackOpts)
        , streamToPromise(
          vFs.src(path.join(inDir, '**/*.js'))
            .pipe(vFs.dest(outDir))
            .pipe(refresh())
        )
      ]);
    })
    .then(refresh.reload())
    ;
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  return streamToPromise(
    gulp.watch(path.join(inDir, '**/*.js'), ['js-build'])
  );
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
