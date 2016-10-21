'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , gulp = require('gulp')
  , mkdirpAsync = bPromise.promisify(require('mkdirp'))
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , utils = require('../lib/utils')
  ;


//------//
// Init //
//------//

const inDir = path.join(__dirname, '../src/client/views')
  , outDir = path.join(__dirname, '../release/views')
  , { streamToPromise } = utils
  , refresh = global.refresh
  ;


//------//
// Main //
//------//

gulp.task('njk-build', build)
  .task('njk-clean', clean)
  ;


//-------------//
// Helper Fxns //
//-------------//

function build() {
  return clean()
    .then(() => mkdirpAsync(inDir))
    .then(() => ncpAsync(inDir, outDir))
    .then(() => refresh.reload())
    ;
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  console.log('watching: ' + path.join(inDir, '**/*'));
  return streamToPromise(
    gulp.watch(path.join(inDir, '**/*'), ['njk-build'])
  );
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
