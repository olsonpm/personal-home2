'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , gulp = require('gulp')
  , path = require('path')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , utils = require('../lib/utils')
  , vFs = require('vinyl-fs')
  ;


//------//
// Init //
//------//

const inDir = path.join(__dirname, '../src/client/assets/img/*')
  , outDir = path.join(__dirname, '../release/static/img')
  , { streamToPromise } = utils
  , refresh = global.refresh
  ;


//------//
// Main //
//------//

gulp.task('img-build', build)
  .task('img-clean', clean);


//-------------//
// Helper Fxns //
//-------------//

function build() {
  return clean()
    .then(streamToPromise(
      vFs.src(inDir)
        .pipe(vFs.dest(outDir))
        .pipe(refresh())
    ));
}

function clean() {
  return rimrafAsync(outDir);
}

function watch() {
  return streamToPromise(
    gulp.watch(path.join(inDir, '**/*'), ['img-build'])
  );
}


//---------//
// Exports //
//---------//

module.exports = { build, clean, watch };
