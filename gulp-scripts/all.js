'use strict';


//---------//
// Globals //
//---------//

const refresh = global.refresh = require('gulp-refresh');


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');

const backend = require('../src/server')
  , bFs = bPromise.promisifyAll(require('fs'))
  , fp = require('lodash/fp')
  , gulp = require('gulp')
  , minimist = require('minimist')
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , ssl = require('../ssl')
  , tasks = fp.reduce(
    (res, val) => fp.set(val, require('./' + val), res)
    , {}
    , ['njk', 'js', 'scss', 'fonts', 'img']
  )
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , hasSsl = argv.ssl
  , isDev = !!argv.dev
  ;


//------//
// Main //
//------//

gulp.task('build', build)
  .task('clean', clean)
  .task('serve', ['build'], () => {
    listen();
    return backend.start()
      .then(watchAll);
  });

function build() {
  return clean().then(buildAll);
}


//-------------//
// Helper Fxns //
//-------------//

function buildAll() {
  return bPromise.all(
      fp.invokeMap('build', tasks)
    )
    .then(() => {
      if (isDev) {
        return ncpAsync(
          path.join(__dirname, '../node_modules/livereload-js/dist/livereload.js')
          , path.join(__dirname, '../dist/static/js/livereload.js')
        );
      }
    });
}

function watchAll() {
  return bPromise.all(
    fp.invokeMap('watch', tasks)
  );
}

function clean() {
  return cleanDir(path.join(__dirname, '../dist'));
}

function listen() {
  let opts = {
    basePath: path.join(__dirname, '../dist')
    , reloadPage: '/'
  };

  if (hasSsl) {
    opts = fp.assign(
      opts
      , ssl.get('credentials')
    );
  }

  refresh.listen(opts);
}

function cleanDir(dir) {
  dir = path.resolve(dir);
  return rimrafAsync(dir)
    .thenReturn(dir)
    .then(bFs.mkdirAsync.bind(bFs));
}


//---------//
// Exports //
//---------//

module.exports = { build };
