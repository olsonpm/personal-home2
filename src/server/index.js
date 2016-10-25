'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , bFs = bPromise.promisifyAll(require('fs'))
  , Koa = require('koa')
  , koaCompress = require('koa-compress')
  , koaNunjucks = require('koa-nunjucks-2')
  , koaRouter = require('koa-router')
  , koaStatic = require('koa-static')
  , minimist = require('minimist')
  , path = require('path')
  ;


//------//
// Init //
//------//

const app = new Koa()
  , argv = minimist(process.argv.slice(2))
  , releaseDir = __dirname
  ;

let router = koaRouter()
  , isDev = !!argv.dev
  ;


//------//
// Main //
//------//

const getApp = (letsEncryptStaticDir, isDev_) => {
  if (typeof isDev_ !== 'undefined') isDev = isDev_;

  app.use(koaCompress())
    .use(koaStatic(path.join(releaseDir, 'static')));

  if (letsEncryptStaticDir) {
    app.use(koaStatic(letsEncryptStaticDir, { hidden: true }));
  }

  if (isDev) {
    app.use((ctx, next) => {
      return next()
        .catch(err => {
          if (ctx.status === 500) {
            console.error(err);
            ctx.type = 'html';
            ctx.body = bFs.createReadStream(path.join(releaseDir, 'views/errors/500.html'));
            ctx.status = 200;
          } else {
            throw err;
          }
        });
    });
  }

  app.use(
    koaNunjucks({
      path: path.join(releaseDir, 'views')
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

module.exports = { getApp };
