'use strict';


//---------//
// Globals //
//---------//

const refresh = global.refresh = require('gulp-refresh');


//---------//
// Imports //
//---------//

const bPromise = require('bluebird');

const bFs = bPromise.promisifyAll(require('fs'))
  , chalk = require('chalk')
  , fp = require('lodash/fp')
  , gulp = require('gulp')
  , http = require('http')
  , minimist = require('minimist')
  , ncpAsync = bPromise.promisifyAll(require('ncp'))
  , path = require('path')
  , portfinder = require('portfinder')
  , requireReload = require('require-reload')
  , rimrafAsync = bPromise.promisify(require('rimraf'))
  , tasks = fp.reduce(
    (res, val) => fp.set(val, require('./' + val), res)
    , {}
    , ['njk', 'js', 'scss', 'fonts', 'img']
  )
  , webpack = require('webpack')
  , webpackConfig = require('../webpack.config')
  ;


//------//
// Init //
//------//

const argv = minimist(process.argv.slice(2))
  , bGetPort = bPromise.promisify(portfinder.getPort)
  , bWebpack = bPromise.promisify(webpack)
  , highlight = chalk.green
  , isDev = !!argv.dev
  , reload = requireReload(require)
  ;


//------//
// Main //
//------//

gulp.task('build', build)
  .task('clean', clean)
  .task('build-release', ['build'], buildRelease)
  .task('serve', ['build'], () => {
    const compiler = webpack(webpackConfig);
    let requestListener;

    bGetPort().then(aPort => {
      // can't just pass requestListener since it may get hotreloaded
      http.createServer((req, res) => requestListener(req, res))
        .listen(aPort);

      console.log('listening on port: ' + highlight(aPort));
    });

    listen();

    compiler.watch({}, (err, stats) => {
      if (err || stats.hasErrors()) return;

      // no errors, good to go
      requestListener = reload('../release/index.pack').getRequestListener();
      console.log('webpack finished building');
      refresh.reload();
    });

    return watchAll();
  });

function build() {
  return clean().then(buildAll);
}

function buildRelease() {
  return bWebpack(webpackConfig).then(stats => {
    if (stats.hasErrors())
      throw new Error("Error during compile: " + JSON.stringify(stats.toJson(true), null, 2));
  });
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
          , path.join(__dirname, '../release/static/js/livereload.js')
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
  return cleanDir(path.join(__dirname, '../release'));
}

function listen() {
  let opts = {
    basePath: path.join(__dirname, '../release')
    , reloadPage: '/'
  };

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
