'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , chalk = require('chalk')
  , http2 = require('http2')
  , Koa = require('koa')
  , koaCompress = require('koa-compress')
  , koaNunjucks = require('koa-nunjucks-2')
  , koaRouter = require('koa-router')
  , koaStatic = require('koa-static')
  , minimist = require('minimist')
  , path = require('path')
  , portfinder = bPromise.promisifyAll(require('portfinder'))
  , ssl = require('../../ssl')
  ;


//------//
// Init //
//------//

const app = new Koa()
  , argv = minimist(process.argv.slice(2), { default: { ssl: true }})
  , distDir = path.resolve(path.join(__dirname, '../../dist'))
  , hasSsl = argv.ssl
  , highlight = chalk.green
  , http2Options = ssl.get('credentials')
  ;

let router = koaRouter()
  , isDev = !!argv.dev
  ;


//------//
// Main //
//------//

const getApp = (letsEncryptStaticDir, isDev_) => {
  if (typeof isDev_ === 'undefined') isDev = isDev_;

  app.use(koaCompress())
    .use(koaStatic(path.join(__dirname, '../../dist/static')));

  if (letsEncryptStaticDir) {
    app.use(koaStatic(letsEncryptStaticDir));
  }

  if (isDev) {
    app.use((ctx, next) => {
      return next()
        .catch(err => {
          if (ctx.status === 500) {
            console.error(err);
            ctx.type = 'html';
            ctx.body = bFs.createReadStream(path.join(__dirname, '../../dist/views/errors/500.html'));
            ctx.status = 200;
          } else {
            throw err;
          }
        });
    });
  }

  app.use(
    koaNunjucks({
      path: path.join(distDir, 'views')
      , nunjucksConfig: {
        noCache: isDev
        , throwOnUndefined: true
        , watch: isDev
      }
    })
  );

  router = setupRoutes(router);

  app.use(router.routes())
    .use(router.allowedMethods());

  return app;
};

const start = () => {
  return bPromise.props({
      port: argv.port || portfinder.getPortAsync()
      , app: getApp()
    })
    .then(({ port, app }) => {
      let server;

      if (hasSsl) {
        server = http2.createServer(
            http2Options
            , app.callback()
          )
          .listen(port);
      } else {
        server = app.listen(port);
      }

      console.log('listening on port ' + highlight(port));

      return { port, server };
    });
};


//-------------//
// Helper Fxns //
//-------------//

function setupRoutes(router) {
  router.get('/', ctx => {
    return ctx.render(
      'home'
      , { isDev }
    );
  });

  return router;
}


//---------//
// Exports //
//---------//

module.exports = { start, getApp };
